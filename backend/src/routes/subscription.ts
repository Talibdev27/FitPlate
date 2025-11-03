import { Router } from 'express';
import {
  getCurrentSubscription,
  getCurrentUserSubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require user authentication
router.use(authenticate);

// Get current user's active subscription
router.get('/current', asyncHandler(getCurrentSubscription));

// Get all user subscriptions
router.get('/', asyncHandler(getCurrentUserSubscriptions));

// Pause subscription
router.post('/pause', asyncHandler(pauseSubscription));

// Resume subscription
router.post('/resume', asyncHandler(resumeSubscription));

// Cancel subscription
router.post('/cancel', asyncHandler(cancelSubscription));

export default router;
