import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isPhoneVerified: boolean;
  age?: number | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  currentWeight?: number | null;
  height?: number | null;
  targetWeight?: number | null;
  goal?: 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'ATHLETIC_PERFORMANCE' | null;
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE' | null;
  dietaryRestrictions?: any;
  allergies?: any;
  foodDislikes?: any;
  preferredCuisines?: any;
  mealPreferences?: any;
  nutritionGoals?: any;
  locationId?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
    orders: number;
  };
}

export interface UsersListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  verified?: boolean;
  locationId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateUserData {
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  phone?: string | null;
  age?: number | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  currentWeight?: number | null;
  height?: number | null;
  targetWeight?: number | null;
  goal?: 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'ATHLETIC_PERFORMANCE' | null;
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE' | null;
  dietaryRestrictions?: any;
  allergies?: any;
  foodDislikes?: any;
  preferredCuisines?: any;
  mealPreferences?: any;
  nutritionGoals?: any;
  locationId?: string | null;
  isPhoneVerified?: boolean;
}

export const usersApi = {
  getUsers: async (params?: GetUsersParams): Promise<ApiResponse<UsersListResponse>> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserData): Promise<ApiResponse<User>> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  getUserOrders: async (id: string, page?: number, limit?: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/users/${id}/orders`, {
      params: { page, limit },
    });
    return response.data;
  },

  getUserSubscriptions: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/users/${id}/subscriptions`);
    return response.data;
  },
};

