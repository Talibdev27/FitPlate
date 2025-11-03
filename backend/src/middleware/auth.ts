import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';
import { TokenPayload, StaffRole } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
  staffId?: string;
  staffRole?: StaffRole;
  userType?: 'user' | 'staff';
  user?: {
    id: string;
    email: string;
    phone: string;
  };
  staff?: {
    id: string;
    email: string;
    phone: string;
    role: StaffRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Authentication required', 401);
    }

    const token = authHeader.substring(7);
    // Use the same default secret as jwt.ts to ensure tokens work
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production';
    
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Handle user tokens
    if (decoded.type === 'user' && decoded.userId) {
      req.userId = decoded.userId;
      req.userType = 'user';
    }
    // Handle staff tokens
    else if (decoded.type === 'staff' && decoded.staffId) {
      req.staffId = decoded.staffId;
      req.staffRole = decoded.role;
      req.userType = 'staff';
    } else {
      throw createError('Invalid token', 401);
    }
    
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(createError('Invalid or expired token', 401));
    }
    next(error);
  }
};

// Middleware specifically for staff authentication
export const authenticateStaff = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Authentication required', 401);
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production';
    
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    if (decoded.type !== 'staff' || !decoded.staffId) {
      throw createError('Staff authentication required', 403);
    }
    
    req.staffId = decoded.staffId;
    req.staffRole = decoded.role;
    req.userType = 'staff';
    
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(createError('Invalid or expired token', 401));
    }
    next(error);
  }
};

// Middleware to require specific role
export const requireRole = (allowedRole: StaffRole) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userType !== 'staff') {
      return next(createError('Staff access required', 403));
    }
    
    if (req.staffRole !== allowedRole) {
      return next(createError(`Access denied. ${allowedRole} role required.`, 403));
    }
    
    next();
  };
};

// Middleware to require any of the specified roles
export const requireAnyRole = (allowedRoles: StaffRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userType !== 'staff') {
      return next(createError('Staff access required', 403));
    }
    
    if (!req.staffRole || !allowedRoles.includes(req.staffRole)) {
      return next(createError('Access denied. Insufficient permissions.', 403));
    }
    
    next();
  };
};

