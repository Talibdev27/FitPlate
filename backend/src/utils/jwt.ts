import jwt from 'jsonwebtoken';

// Use default secrets for development if not provided
// Use a fixed default secret so tokens work across restarts
const DEFAULT_JWT_SECRET = 'dev-jwt-secret-key-change-in-production';
const DEFAULT_JWT_REFRESH_SECRET = 'dev-refresh-secret-key-change-in-production';

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
};

const getJwtRefreshSecret = (): string => {
  return process.env.JWT_REFRESH_SECRET || DEFAULT_JWT_REFRESH_SECRET;
};

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export type UserType = 'user' | 'staff';
export type StaffRole = 'SUPER_ADMIN' | 'LOCATION_MANAGER' | 'CHEF' | 'DELIVERY_DRIVER' | 'CUSTOMER_SUPPORT' | 'NUTRITIONIST';

export interface TokenPayload {
  // User token payload
  userId?: string;
  // Staff token payload
  staffId?: string;
  // Common fields
  email: string;
  type: UserType;
  role?: StaffRole; // Only present for staff tokens
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = getJwtSecret();
  // Type assertion needed due to TypeScript strict type checking with jwt library
  return jwt.sign(payload, secret as jwt.Secret, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = getJwtRefreshSecret();
  // Type assertion needed due to TypeScript strict type checking with jwt library
  return jwt.sign(payload, secret as jwt.Secret, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const secret = getJwtSecret();
  return jwt.verify(token, secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const secret = getJwtRefreshSecret();
  return jwt.verify(token, secret) as TokenPayload;
};

// Helper functions to create payloads
export const createUserTokenPayload = (userId: string, email: string): TokenPayload => {
  return {
    userId,
    email,
    type: 'user',
  };
};

export const createStaffTokenPayload = (staffId: string, email: string, role: StaffRole): TokenPayload => {
  return {
    staffId,
    email,
    type: 'staff',
    role,
  };
};

