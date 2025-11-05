import axios from 'axios';

// Get API URL from environment variable or use default
let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Validate and normalize API URL
const isValidAbsoluteUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Check if API_URL is missing or invalid in production
if (import.meta.env.MODE === 'production') {
  if (!import.meta.env.VITE_API_URL) {
    console.error(
      '[API Config Error] VITE_API_URL is not set in Vercel environment variables!',
      '\nPlease set VITE_API_URL to your backend URL (e.g., https://fitplate-production.up.railway.app/api)',
      '\nCurrent API_URL will be:', API_URL
    );
  } else if (!isValidAbsoluteUrl(API_URL)) {
    console.error(
      '[API Config Error] VITE_API_URL must be an absolute URL with protocol (http:// or https://)',
      '\nCurrent value:', import.meta.env.VITE_API_URL,
      '\nExpected format: https://your-backend-domain.com/api'
    );
    // In production, if URL is invalid, we should throw an error to prevent deployment
    throw new Error(
      `Invalid VITE_API_URL: "${import.meta.env.VITE_API_URL}". Must be an absolute URL starting with http:// or https://`
    );
  }
}

// Ensure API URL is absolute (starts with http:// or https://)
if (!API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  // If it's not absolute, prepend https:// (assuming production)
  if (import.meta.env.MODE === 'production') {
    console.warn(
      '[API Config Warning] VITE_API_URL missing protocol, prepending https://',
      '\nOriginal:', API_URL
    );
    API_URL = `https://${API_URL}`;
  } else {
    // In development, default to localhost
    API_URL = 'http://localhost:5001/api';
  }
}

// Normalize the URL: remove trailing slashes, then ensure /api is at the end
API_URL = API_URL.replace(/\/+$/, ''); // Remove trailing slashes
if (!API_URL.endsWith('/api')) {
  API_URL = `${API_URL}/api`;
}

// Log API URL in production for debugging
if (import.meta.env.MODE === 'production') {
  console.log('[API Config] Using API URL:', API_URL);
} else {
  console.log('[API Config] Development API URL:', API_URL);
}

// Final validation
if (!isValidAbsoluteUrl(API_URL)) {
  throw new Error(`Invalid API_URL after normalization: "${API_URL}". Must be an absolute URL.`);
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Try staff token first (for admin routes), then user token
    const staffToken = localStorage.getItem('staffAccessToken');
    const userToken = localStorage.getItem('accessToken');
    const token = staffToken || userToken;
    
    // Debug logging (only in development)
    if (import.meta.env.MODE === 'development' && config.url?.includes('/users')) {
      console.log('[API Debug] Request to:', config.url);
      console.log('[API Debug] Has staff token:', !!staffToken);
      console.log('[API Debug] Has user token:', !!userToken);
      console.log('[API Debug] Using token:', token ? `${token.substring(0, 20)}...` : 'none');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Log warning if no token for API calls (except auth endpoints)
      if (!config.url?.includes('/auth') && import.meta.env.MODE === 'development') {
        console.warn('[API Warning] No token found for request to:', config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Debug logging for 401 errors
    if (error.response?.status === 401 && import.meta.env.MODE === 'development') {
      console.error('[API Error] 401 Unauthorized');
      console.error('[API Error] URL:', error.config?.url);
      console.error('[API Error] Error message:', error.response?.data?.error?.message);
      console.error('[API Error] Has staff token:', !!localStorage.getItem('staffAccessToken'));
      console.error('[API Error] Has user token:', !!localStorage.getItem('accessToken'));
      console.error('[API Error] Request headers:', error.config?.headers);
    }
    
    if (error.response?.status === 401) {
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      const hasStaffToken = !!localStorage.getItem('staffAccessToken');
      const hasUserToken = !!localStorage.getItem('accessToken');
      const errorMessage = error.response?.data?.error?.message || '';
      
      // Only redirect if we truly don't have a token (not just expired)
      // If we have a token but got 401, let the component handle it
      // This prevents redirect loops and allows components to show proper error messages
      const noTokenAtAll = (isAdminRoute && !hasStaffToken) || (!isAdminRoute && !hasUserToken);
      
      // Only redirect if:
      // 1. We have no token at all (not even expired one), AND
      // 2. We're not already on the login page, AND
      // 3. The error says "Authentication required" (not "expired" or other errors)
      if (noTokenAtAll && 
          errorMessage.includes('Authentication required') &&
          !errorMessage.includes('expired') &&
          ((isAdminRoute && window.location.pathname !== '/admin/login') ||
           (!isAdminRoute && window.location.pathname !== '/login'))) {
        
        if (isAdminRoute) {
          localStorage.removeItem('staffAccessToken');
          localStorage.removeItem('staffRefreshToken');
          window.location.href = '/admin/login';
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
      // Otherwise, let the component handle the error (might be expired token, permission issue, etc.)
    }
    return Promise.reject(error);
  }
);

