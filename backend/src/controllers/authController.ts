import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/db';
import { generateOTP, getOTPExpiry, isOTPExpired } from '../utils/otp';
import { generateAccessToken, generateRefreshToken, TokenPayload, createUserTokenPayload, createStaffTokenPayload, StaffRole } from '../utils/jwt';
import { smsService } from '../services/smsService';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: AuthRequest, res: Response) => {
  const { email, password, phone, firstName, lastName } = req.body;

  // Validation - email and password are required, phone is optional
  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  // Check if user exists by email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError('User with this email already exists', 409);
  }

  // If phone is provided, check if it's already taken
  const trimmedPhone = phone?.trim();
  if (trimmedPhone) {
    const existingPhoneUser = await prisma.user.findUnique({
      where: { phone: trimmedPhone },
    });
    if (existingPhoneUser) {
      throw createError('User with this phone number already exists', 409);
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user with phone verified by default (no OTP required for now)
  const userData: {
    email: string;
    passwordHash: string;
    isPhoneVerified: boolean;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } = {
    email,
    passwordHash,
    isPhoneVerified: true, // Auto-verify for email/password auth
  };

  // Only add optional fields if they have values
  if (trimmedPhone) {
    userData.phone = trimmedPhone;
  }
  if (firstName) {
    userData.firstName = firstName;
  }
  if (lastName) {
    userData.lastName = lastName;
  }

  const user = await prisma.user.create({
    data: userData,
  });

  // Generate tokens immediately
  const payload = createUserTokenPayload(user.id, user.email);

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
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

export const verifyOTP = async (req: AuthRequest, res: Response) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    throw createError('User ID and OTP code are required', 400);
  }

  // Find OTP record
  const otpRecord = await prisma.oTPVerification.findFirst({
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
  await prisma.oTPVerification.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  // Mark user as verified
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isPhoneVerified: true },
  });

  // Generate tokens
  const payload = createUserTokenPayload(user.id, user.email);

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

  if (!user.phone) {
    throw createError('User does not have a phone number', 400);
  }

  // Generate new OTP
  const otpCode = generateOTP();
  const expiresAt = getOTPExpiry(10);

  await prisma.oTPVerification.create({
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

  // Generate tokens immediately (no phone verification required)
  const payload = createUserTokenPayload(user.id, user.email);

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

export const staffLogin = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  // Find staff member
  const staff = await prisma.staff.findUnique({
    where: { email },
  });

  if (!staff) {
    throw createError('Invalid email or password', 401);
  }

  // Check if staff is active
  if (!staff.isActive) {
    throw createError('Your account has been deactivated. Please contact an administrator.', 403);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, staff.passwordHash);

  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Generate tokens with role information
  const payload = createStaffTokenPayload(staff.id, staff.email, staff.role as StaffRole);

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.json({
    success: true,
    data: {
      staff: {
        id: staff.id,
        email: staff.email,
        phone: staff.phone,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
        locationId: staff.locationId,
        isActive: staff.isActive,
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

