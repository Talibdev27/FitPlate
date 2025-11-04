import { apiClient } from './client';
import { ApiResponse } from '../types';

interface CreatePaymentData {
  amount: number;
  orderId?: string;
  subscriptionId?: string;
  description?: string;
  returnUrl?: string;
}

interface PaymentResponse {
  paymentId: string;
  invoiceId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
}

interface PaymentStatus {
  paymentId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface VerifyPaymentResponse {
  paymentId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amount: number;
  paymeStatus: 'pending' | 'paid' | 'cancelled' | 'expired';
}

export const paymentApi = {
  /**
   * Create a Payme payment
   */
  createPaymePayment: async (data: CreatePaymentData): Promise<ApiResponse<PaymentResponse>> => {
    const response = await apiClient.post('/payments/payme/create', data);
    return response.data;
  },

  /**
   * Verify payment status with Payme
   */
  verifyPayment: async (paymentId: string): Promise<ApiResponse<VerifyPaymentResponse>> => {
    const response = await apiClient.post(`/payments/payme/verify/${paymentId}`);
    return response.data;
  },

  /**
   * Get payment status
   */
  getPaymentStatus: async (paymentId: string): Promise<ApiResponse<PaymentStatus>> => {
    const response = await apiClient.get(`/payments/${paymentId}/status`);
    return response.data;
  },
};

