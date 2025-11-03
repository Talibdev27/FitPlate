import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface OrderItem {
  id: string;
  mealId: string;
  quantity: number;
  portionSize: string;
  price: number;
  meal: {
    id: string;
    name: any;
    imageUrls?: any;
  };
}

export interface Order {
  id: string;
  userId: string;
  subscriptionId?: string;
  deliveryDate: string;
  status: string;
  locationId: string;
  driverId?: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  location: {
    id: string;
    name: string;
    city: string;
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
}

export interface OrdersListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const ordersApi = {
  getOrders: async (params?: GetOrdersParams): Promise<ApiResponse<OrdersListResponse>> => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  assignDriver: async (id: string, driverId: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put(`/orders/${id}/assign-driver`, { driverId });
    return response.data;
  },
};
