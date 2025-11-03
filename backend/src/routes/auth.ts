import { Router } from 'express';
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshToken,
  staffLogin,
} from '../controllers/authController';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Registration
router.post('/register', authRateLimiter, asyncHandler(register));

// OTP verification
router.post('/verify-otp', otpRateLimiter, asyncHandler(verifyOTP));
router.post('/resend-otp', otpRateLimiter, asyncHandler(resendOTP));

// Login
router.post('/login', authRateLimiter, asyncHandler(login));

// Token refresh
router.post('/refresh-token', asyncHandler(refreshToken));

// Staff authentication
router.post('/staff/login', authRateLimiter, asyncHandler(staffLogin));
router.post('/staff/refresh-token', asyncHandler(refreshToken));

export default router;

