import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface Meal {
  id: string;
  name: {
    uz: string;
    ru: string;
    en: string;
  };
  description: {
    uz: string;
    ru: string;
    en: string;
  };
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  ingredients: any[];
  recipe?: any;
  prepTime?: number;
  cookTime?: number;
  price: number;
  cost?: number;
  category?: string;
  dietaryTags: string[];
  cuisine?: string;
  imageUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orderItems: number;
  };
}

export interface MealsListResponse {
  meals: Meal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetMealsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  cuisine?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMealData {
  name: {
    uz: string;
    ru: string;
    en: string;
  };
  description: {
    uz: string;
    ru: string;
    en: string;
  };
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  ingredients?: any[];
  recipe?: any;
  prepTime?: number;
  cookTime?: number;
  price: number;
  cost?: number;
  category?: string;
  dietaryTags?: string[];
  cuisine?: string;
  imageUrls?: string[];
  isActive?: boolean;
}

export interface UpdateMealData extends Partial<CreateMealData> {}

export const mealsApi = {
  getMeals: async (params?: GetMealsParams): Promise<ApiResponse<MealsListResponse>> => {
    const response = await apiClient.get('/meals', { params });
    return response.data;
  },

  getMealById: async (id: string): Promise<ApiResponse<Meal>> => {
    const response = await apiClient.get(`/meals/${id}`);
    return response.data;
  },

  createMeal: async (data: CreateMealData): Promise<ApiResponse<Meal>> => {
    const response = await apiClient.post('/meals', data);
    return response.data;
  },

  updateMeal: async (id: string, data: UpdateMealData): Promise<ApiResponse<Meal>> => {
    const response = await apiClient.put(`/meals/${id}`, data);
    return response.data;
  },

  deleteMeal: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/meals/${id}`);
    return response.data;
  },
};
