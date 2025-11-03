import { apiClient } from './client';
import { ApiResponse } from '../types';
import { StaffRole } from '../store/staffAuthStore';

export interface Staff {
  id: string;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  role: StaffRole;
  locationId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  location?: {
    id: string;
    name: string;
    city: string;
  };
  _count?: {
    deliveries: number;
  };
}

export interface StaffListResponse {
  staff: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: StaffRole;
  locationId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateStaffData {
  email: string;
  password: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  locationId?: string;
  isActive?: boolean;
}

export interface UpdateStaffData {
  email?: string;
  password?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role?: StaffRole;
  locationId?: string;
  isActive?: boolean;
}

export const staffApi = {
  getStaff: async (params?: GetStaffParams): Promise<ApiResponse<StaffListResponse>> => {
    const response = await apiClient.get('/staff', { params });
    return response.data;
  },

  getStaffById: async (id: string): Promise<ApiResponse<Staff>> => {
    const response = await apiClient.get(`/staff/${id}`);
    return response.data;
  },

  createStaff: async (data: CreateStaffData): Promise<ApiResponse<Staff>> => {
    const response = await apiClient.post('/staff', data);
    return response.data;
  },

  updateStaff: async (id: string, data: UpdateStaffData): Promise<ApiResponse<Staff>> => {
    const response = await apiClient.put(`/staff/${id}`, data);
    return response.data;
  },

  deleteStaff: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/staff/${id}`);
    return response.data;
  },
};
