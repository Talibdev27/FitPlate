import { Router } from 'express';
import { getCurrentProfile, updateCurrentProfile } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require user authentication (not staff)
router.use(authenticate);

// Get current user profile
router.get('/me', asyncHandler(getCurrentProfile));

// Update current user profile
router.put('/me', asyncHandler(updateCurrentProfile));

export default router;
