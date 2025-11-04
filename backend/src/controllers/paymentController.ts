import { Response } from 'express';
import prisma from '../utils/db';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
// import { paymeService } from '../services/paymeService'; // Commented out - Payme disabled until credentials are available

interface CreatePaymentBody {
  amount: number;
  orderId?: string;
  subscriptionId?: string;
  description?: string;
  returnUrl?: string;
}

// ============================================================================
// PAYME FUNCTIONS - COMMENTED OUT UNTIL CREDENTIALS ARE AVAILABLE
// ============================================================================
/**
 * Create a Payme payment
 * @deprecated Commented out until Payme credentials are available
 */
/*
export const createPaymePayment = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User authentication required', 401);
  }

  const { amount, orderId, subscriptionId, description, returnUrl }: CreatePaymentBody = req.body;

  if (!amount || amount <= 0) {
    throw createError('Invalid payment amount', 400);
  }

  if (!orderId && !subscriptionId) {
    throw createError('Either orderId or subscriptionId is required', 400);
  }

  try {
    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: req.userId,
        orderId: orderId || null,
        subscriptionId: subscriptionId || null,
        amount,
        currency: 'UZS',
        status: 'PENDING',
        paymentMethod: 'payme',
      },
    });

    // Create Payme invoice
    const paymeResult = await paymeService.createPayment({
      amount,
      orderId: payment.id,
      userId: req.userId,
      description: description || `Payment for ${subscriptionId ? 'subscription' : 'order'} ${payment.id}`,
      returnUrl: returnUrl || `${process.env.FRONTEND_URL}/onboarding/payment/callback`,
    });

    // Update payment with Payme transaction ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: paymeResult.invoiceId,
        gatewayResponse: {
          invoiceId: paymeResult.invoiceId,
          paymentUrl: paymeResult.paymentUrl,
        },
      },
    });

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        invoiceId: paymeResult.invoiceId,
        paymentUrl: paymeResult.paymentUrl,
        amount,
        currency: 'UZS',
      },
    });
  } catch (error: any) {
    console.error('Error creating Payme payment:', error);
    throw createError(error.message || 'Failed to create payment', 500);
  }
};
*/

/**
 * Verify payment status (Payme-specific)
 * @deprecated Commented out until Payme credentials are available
 */
/*
export const verifyPayment = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User authentication required', 401);
  }

  const { paymentId } = req.params;

  try {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: req.userId,
      },
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    if (!payment.transactionId) {
      throw createError('Payment transaction ID not found', 400);
    }

    // Check status with Payme
    const paymeStatus = await paymeService.checkPaymentStatus(payment.transactionId);

    // Update payment status
    let status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' = 'PENDING';
    if (paymeStatus.status === 'paid') {
      status = 'COMPLETED';
    } else if (paymeStatus.status === 'cancelled' || paymeStatus.status === 'expired') {
      status = 'FAILED';
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        gatewayResponse: {
          ...(payment.gatewayResponse as any),
          lastChecked: new Date().toISOString(),
          paymeStatus: paymeStatus.status,
        },
      },
    });

    res.json({
      success: true,
      data: {
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
        paymeStatus: paymeStatus.status,
      },
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    throw createError(error.message || 'Failed to verify payment', 500);
  }
};
*/

/**
 * Get payment status (generic - works for all payment methods)
 */
export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User authentication required', 401);
  }

  const { paymentId } = req.params;

  try {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: req.userId,
      },
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    throw createError(error.message || 'Failed to get payment status', 500);
  }
};

/**
 * Handle Payme webhook
 * @deprecated Commented out until Payme credentials are available
 */
/*
export const handlePaymeWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const { method, params } = req.body;

    // Payme sends different methods for different events
    if (method === 'receipts.pay') {
      // Payment completed
      const invoiceId = params.receipt._id;
      const transactionId = params.receipt.transaction?._id;

      // Find payment by transaction ID
      const payment = await prisma.payment.findFirst({
        where: {
          transactionId: invoiceId,
        },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            gatewayResponse: {
              ...(payment.gatewayResponse as any),
              webhook: {
                method,
                params,
                receivedAt: new Date().toISOString(),
              },
            },
          },
        });

        // If this is a subscription payment, activate the subscription
        if (payment.subscriptionId) {
          await prisma.subscription.update({
            where: { id: payment.subscriptionId },
            data: {
              status: 'ACTIVE',
            },
          });
        }

        // If this is an order payment, update order status
        if (payment.orderId) {
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'PENDING',
            },
          });
        }
      }
    } else if (method === 'receipts.cancel') {
      // Payment cancelled
      const invoiceId = params.receipt._id;

      const payment = await prisma.payment.findFirst({
        where: {
          transactionId: invoiceId,
        },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            gatewayResponse: {
              ...(payment.gatewayResponse as any),
              webhook: {
                method,
                params,
                receivedAt: new Date().toISOString(),
              },
            },
          },
        });
      }
    }

    res.json({
      result: {
        receipt: {
          _id: params.receipt?._id || 'unknown',
          state: 1, // 1 = paid
        },
      },
    });
  } catch (error: any) {
    console.error('Error handling Payme webhook:', error);
    res.status(500).json({
      error: {
        code: -32603,
        message: 'Internal error',
      },
    });
  }
};
*/
// ============================================================================

/**
 * Create a cash payment
 * Cash payments are immediately marked as COMPLETED (cash on delivery)
 */
export const createCashPayment = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User authentication required', 401);
  }

  const { amount, orderId, subscriptionId, description }: CreatePaymentBody = req.body;

  if (!amount || amount <= 0) {
    throw createError('Invalid payment amount', 400);
  }

  if (!orderId && !subscriptionId) {
    throw createError('Either orderId or subscriptionId is required', 400);
  }

  try {
    // Create payment record in database with COMPLETED status (cash on delivery)
    const payment = await prisma.payment.create({
      data: {
        userId: req.userId,
        orderId: orderId || null,
        subscriptionId: subscriptionId || null,
        amount,
        currency: 'UZS',
        status: 'COMPLETED', // Cash payments are immediately completed
        paymentMethod: 'cash',
        transactionId: null, // Cash doesn't have transaction ID
        gatewayResponse: {
          method: 'cash',
          completedAt: new Date().toISOString(),
          description: description || `Cash payment for ${subscriptionId ? 'subscription' : 'order'}`,
        },
      },
    });

    // If this is a subscription payment, activate the subscription
    if (payment.subscriptionId) {
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: 'ACTIVE',
          paymentStatus: 'COMPLETED',
        },
      });
    }

    // If this is an order payment, update order status
    if (payment.orderId) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PENDING', // Order is ready to be prepared
        },
      });
    }

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        orderId: payment.orderId,
        subscriptionId: payment.subscriptionId,
        createdAt: payment.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating cash payment:', error);
    throw createError(error.message || 'Failed to create payment', 500);
  }
};

