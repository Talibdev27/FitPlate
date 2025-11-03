import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/db';
import { generateOTP, getOTPExpiry, isOTPExpired } from '../utils/otp';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt';
import { smsService } from '../services/smsService';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: AuthRequest, res: Response) => {
  const { email, password, phone, firstName, lastName } = req.body;

  // Validation
  if (!email || !password || !phone) {
    throw createError('Email, password, and phone are required', 400);
  }

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    throw createError('User with this email or phone already exists', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      firstName,
      lastName,
      isPhoneVerified: false,
    },
  });

  // Generate OTP
  const otpCode = generateOTP();
  const expiresAt = getOTPExpiry(10); // 10 minutes

  await prisma.otpVerification.create({
    data: {
      userId: user.id,
      phone: user.phone,
      code: otpCode,
      expiresAt,
    },
  });

  // Send OTP via SMS
  await smsService.sendOTP(phone, otpCode);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your phone number.',
    data: {
      userId: user.id,
      requiresVerification: true,
    },
  });
};

export const verifyOTP = async (req: AuthRequest, res: Response) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    throw createError('User ID and OTP code are required', 400);
  }

  // Find OTP record
  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      userId,
      code,
      verified: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    throw createError('Invalid OTP code', 400);
  }

  if (isOTPExpired(otpRecord.expiresAt)) {
    throw createError('OTP code has expired', 400);
  }

  // Mark OTP as verified
  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  // Mark user as verified
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isPhoneVerified: true },
  });

  // Generate tokens
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.json({
    success: true,
    message: 'Phone verified successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
};

export const resendOTP = async (req: AuthRequest, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  if (user.isPhoneVerified) {
    throw createError('Phone already verified', 400);
  }

  // Generate new OTP
  const otpCode = generateOTP();
  const expiresAt = getOTPExpiry(10);

  await prisma.otpVerification.create({
    data: {
      userId: user.id,
      phone: user.phone,
      code: otpCode,
      expiresAt,
    },
  });

  // Send OTP via SMS
  await smsService.sendOTP(user.phone, otpCode);

  res.json({
    success: true,
    message: 'OTP code resent successfully',
  });
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Check if phone is verified
  if (!user.isPhoneVerified) {
    // Allow login but require verification
    return res.json({
      success: true,
      message: 'Phone verification required',
      data: {
        userId: user.id,
        requiresVerification: true,
      },
    });
  }

  // Generate tokens
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        isPhoneVerified: user.isPhoneVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw createError('Refresh token is required', 400);
  }

  try {
    const { verifyRefreshToken } = await import('../utils/jwt');
    const payload = verifyRefreshToken(token);

    // Generate new access token
    const { generateAccessToken } = await import('../utils/jwt');
    const accessToken = generateAccessToken(payload);

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    throw createError('Invalid refresh token', 401);
  }
};

