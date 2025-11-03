import { apiClient } from './client';
import { ApiResponse } from '../types';

interface RegisterData {
  email: string;
  password: string;
  phone: string;
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
    phone: string;
    firstName?: string;
    lastName?: string;
    isPhoneVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  register: async (data: RegisterData): Promise<ApiResponse<{ userId: string; requiresVerification: boolean }>> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<ApiResponse<AuthResponse | { userId: string; requiresVerification: boolean }>> => {
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
};

