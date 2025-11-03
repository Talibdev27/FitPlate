import { apiClient } from './client';
import { ApiResponse } from '../types';

interface RegisterData {
  email: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface VerifyOTPData {
  userId: string;
  code: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    isPhoneVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface StaffAuthResponse {
  staff: {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'LOCATION_MANAGER' | 'CHEF' | 'DELIVERY_DRIVER' | 'CUSTOMER_SUPPORT' | 'NUTRITIONIST';
    locationId?: string | null;
    isActive: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  verifyOTP: async (data: VerifyOTPData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  resendOTP: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/auth/resend-otp', { userId });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // Staff authentication
  staffLogin: async (data: LoginData): Promise<ApiResponse<StaffAuthResponse>> => {
    const response = await apiClient.post('/auth/staff/login', data);
    return response.data;
  },

  staffRefreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await apiClient.post('/auth/staff/refresh-token', { refreshToken });
    return response.data;
  },
};

