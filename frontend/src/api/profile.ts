import { apiClient } from './client';
import { ApiResponse } from '../types';
import { User } from './users';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  currentWeight?: number;
  height?: number;
  targetWeight?: number;
  goal?: 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'ATHLETIC_PERFORMANCE';
  activityLevel?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
  dietaryRestrictions?: string[];
  allergies?: string[];
  foodDislikes?: string[];
  preferredCuisines?: string[];
  mealPreferences?: any;
  nutritionGoals?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  locationId?: string;
}

export const profileApi = {
  getCurrentProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/profile/me');
    return response.data;
  },

  updateCurrentProfile: async (data: UpdateProfileData): Promise<ApiResponse<User>> => {
    const response = await apiClient.put('/profile/me', data);
    return response.data;
  },
};
