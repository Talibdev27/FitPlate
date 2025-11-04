import { Router } from 'express';
import {
  createPaymePayment,
  verifyPayment,
  getPaymentStatus,
  handlePaymeWebhook,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Payme webhook endpoint (no auth required - Payme calls this directly)
router.post('/payme/webhook', asyncHandler(handlePaymeWebhook));

// All other routes require authentication
router.use(authenticate);

// Create Payme payment
router.post('/payme/create', asyncHandler(createPaymePayment));

// Verify payment
router.post('/payme/verify/:paymentId', asyncHandler(verifyPayment));

// Get payment status
router.get('/:paymentId/status', asyncHandler(getPaymentStatus));

export default router;

