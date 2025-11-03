import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface Location {
  id: string;
  name: string;
  city: string;
  district?: string;
  address: string;
  coordinates?: any;
  phone?: string;
  email?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    orders: number;
    staff: number;
  };
}

export interface LocationsListResponse {
  locations: Location[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetLocationsParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateLocationData {
  name: string;
  city: string;
  district?: string;
  address: string;
  coordinates?: any;
  phone?: string;
  email?: string;
  managerId?: string;
  isActive?: boolean;
}

export interface UpdateLocationData extends Partial<CreateLocationData> {}

export const locationsApi = {
  getLocations: async (params?: GetLocationsParams): Promise<ApiResponse<LocationsListResponse>> => {
    const response = await apiClient.get('/locations', { params });
    return response.data;
  },

  getLocationById: async (id: string): Promise<ApiResponse<Location>> => {
    const response = await apiClient.get(`/locations/${id}`);
    return response.data;
  },

  createLocation: async (data: CreateLocationData): Promise<ApiResponse<Location>> => {
    const response = await apiClient.post('/locations', data);
    return response.data;
  },

  updateLocation: async (id: string, data: UpdateLocationData): Promise<ApiResponse<Location>> => {
    const response = await apiClient.put(`/locations/${id}`, data);
    return response.data;
  },

  deleteLocation: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/locations/${id}`);
    return response.data;
  },
};
