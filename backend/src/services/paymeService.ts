import crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';

interface PaymeConfig {
  merchantId: string;
  secretKey: string;
  baseUrl: string;
  testMode: boolean;
}

interface PaymeRequest {
  id: string;
  method: string;
  params: any;
}

interface PaymeResponse {
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface CreatePaymentParams {
  amount: number; // in tiyin (1 UZS = 100 tiyin)
  orderId: string;
  userId: string;
  returnUrl?: string;
  description?: string;
}

interface PaymentAccount {
  order_id: string;
  user_id?: string;
}

export class PaymeService {
  private config: PaymeConfig;
  private client: AxiosInstance;

  constructor() {
    this.config = {
      merchantId: process.env.PAYME_MERCHANT_ID || '',
      secretKey: process.env.PAYME_SECRET_KEY || '',
      baseUrl: process.env.PAYME_BASE_URL || 'https://checkout.paycom.uz',
      testMode: process.env.PAYME_TEST_MODE === 'true',
    };

    // Initialize client lazily - only when credentials are available
    // This allows the service to be imported even if credentials aren't set yet
    if (this.config.merchantId && this.config.secretKey) {
      this.client = axios.create({
        baseURL: this.config.baseUrl,
        headers: {
          'Content-Type': 'application/json',
          'X-Auth': this.config.merchantId,
        },
        timeout: 30000,
      });
    } else {
      // Create a dummy client to prevent errors, but it won't work until credentials are set
      this.client = axios.create({
        baseURL: this.config.baseUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      console.warn('Payme credentials not configured. PaymeService will not function until PAYME_MERCHANT_ID and PAYME_SECRET_KEY are set.');
    }
  }

  /**
   * Check if PaymeService is properly configured
   */
  private ensureConfigured(): void {
    if (!this.config.merchantId || !this.config.secretKey) {
      throw new Error('Payme credentials not configured. Please set PAYME_MERCHANT_ID and PAYME_SECRET_KEY');
    }
    // Reinitialize client if credentials are now available
    if (!this.client.defaults.headers['X-Auth']) {
      this.client = axios.create({
        baseURL: this.config.baseUrl,
        headers: {
          'Content-Type': 'application/json',
          'X-Auth': this.config.merchantId,
        },
        timeout: 30000,
      });
    }
  }

  /**
   * Generate HMAC-SHA256 signature for Payme request
   */
  private generateSignature(data: string): string {
    if (!this.config.secretKey) {
      throw new Error('Payme secret key not configured');
    }
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify signature from Payme response
   */
  private verifySignature(data: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(data);
    return expectedSignature === signature;
  }

  /**
   * Make JSON-RPC 2.0 request to Payme API
   */
  private async makeRequest(method: string, params: any): Promise<PaymeResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: PaymeRequest = {
      id: requestId,
      method,
      params,
    };

    try {
      const response = await this.client.post('/api', request);
      return response.data;
    } catch (error: any) {
      console.error('Payme API request failed:', error.response?.data || error.message);
      throw new Error(`Payme API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Convert UZS amount to tiyin
   * Payme uses tiyin (1 UZS = 100 tiyin)
   */
  private uzsToTiyin(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Create a payment invoice in Payme
   */
  async createPayment(params: CreatePaymentParams): Promise<{ invoiceId: string; paymentUrl: string }> {
    this.ensureConfigured();
    const account: PaymentAccount = {
      order_id: params.orderId,
      user_id: params.userId,
    };

    const paymeParams = {
      amount: this.uzsToTiyin(params.amount),
      account,
      description: params.description || `Payment for order ${params.orderId}`,
    };

    const response = await this.makeRequest('receipts.create', paymeParams);

    if (response.error) {
      throw new Error(`Payme error: ${response.error.message} (code: ${response.error.code})`);
    }

    if (!response.result) {
      throw new Error('Invalid response from Payme API');
    }

    const invoiceId = response.result.receipt._id;
    const paymentUrl = `${this.config.baseUrl}/api/${invoiceId}`;

    return {
      invoiceId,
      paymentUrl,
    };
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(invoiceId: string): Promise<{
    status: 'pending' | 'paid' | 'cancelled' | 'expired';
    amount: number;
    transactionId?: string;
  }> {
    this.ensureConfigured();
    const response = await this.makeRequest('receipts.get', {
      id: invoiceId,
    });

    if (response.error) {
      throw new Error(`Payme error: ${response.error.message} (code: ${response.error.code})`);
    }

    if (!response.result) {
      throw new Error('Invalid response from Payme API');
    }

    const receipt = response.result.receipt;
    const statusMap: Record<number, 'pending' | 'paid' | 'cancelled' | 'expired'> = {
      0: 'pending',
      1: 'paid',
      2: 'cancelled',
      '-1': 'expired',
      '-2': 'cancelled',
    };

    return {
      status: statusMap[receipt.state] || 'pending',
      amount: receipt.amount / 100, // Convert tiyin back to UZS
      transactionId: receipt.transaction?._id,
    };
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(invoiceId: string): Promise<boolean> {
    this.ensureConfigured();
    const response = await this.makeRequest('receipts.cancel', {
      id: invoiceId,
    });

    if (response.error) {
      throw new Error(`Payme error: ${response.error.message} (code: ${response.error.code})`);
    }

    return response.result?.receipt?.state === 2; // 2 = cancelled
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(data: string, signature: string): boolean {
    this.ensureConfigured();
    return this.verifySignature(data, signature);
  }

  /**
   * Get merchant ID
   */
  getMerchantId(): string {
    return this.config.merchantId;
  }

  /**
   * Check if test mode is enabled
   */
  isTestMode(): boolean {
    return this.config.testMode;
  }
}

export const paymeService = new PaymeService();

