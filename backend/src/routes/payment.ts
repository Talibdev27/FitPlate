import { Router } from 'express';
import {
  // createPaymePayment, // Commented out - Payme disabled until credentials are available
  // verifyPayment, // Commented out - Payme disabled until credentials are available
  getPaymentStatus,
  // handlePaymeWebhook, // Commented out - Payme disabled until credentials are available
  createCashPayment, // Cash payment endpoint
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ============================================================================
// PAYME ROUTES - COMMENTED OUT UNTIL CREDENTIALS ARE AVAILABLE
// ============================================================================
// Payme webhook endpoint (no auth required - Payme calls this directly)
// router.post('/payme/webhook', asyncHandler(handlePaymeWebhook));

// All other routes require authentication
router.use(authenticate);

// Create Payme payment
// router.post('/payme/create', asyncHandler(createPaymePayment));

// Verify payment
// router.post('/payme/verify/:paymentId', asyncHandler(verifyPayment));
// ============================================================================

// Cash payment endpoint
router.post('/cash/create', asyncHandler(createCashPayment));

// Get payment status (generic - works for all payment methods)
router.get('/:paymentId/status', asyncHandler(getPaymentStatus));

export default router;

