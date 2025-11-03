import { Router } from 'express';
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshToken,
} from '../controllers/authController';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Registration
router.post('/register', authRateLimiter, register);

// OTP verification
router.post('/verify-otp', otpRateLimiter, verifyOTP);
router.post('/resend-otp', otpRateLimiter, resendOTP);

// Login
router.post('/login', authRateLimiter, login);

// Token refresh
router.post('/refresh-token', refreshToken);

export default router;

