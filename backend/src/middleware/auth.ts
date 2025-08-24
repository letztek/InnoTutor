import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { ErrorCodes } from '../types';
import { logger } from '../utils/logger';

interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'teacher';
  iat: number;
  exp: number;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'student' | 'teacher';
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', 401, ErrorCodes.UNAUTHORIZED);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', 500, ErrorCodes.SYSTEM_UNAVAILABLE);
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    logger.info('User authenticated', {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      path: req.path
    });

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', 401, ErrorCodes.TOKEN_EXPIRED);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401, ErrorCodes.UNAUTHORIZED);
    } else {
      throw error;
    }
  }
};

export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, ErrorCodes.UNAUTHORIZED);
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path
      });
      
      throw new AppError('Insufficient permissions', 403, ErrorCodes.INSUFFICIENT_PERMISSIONS);
    }

    next();
  };
};

export const requireStudent = requireRole('student');
export const requireTeacher = requireRole('teacher');
export const requireAnyRole = requireRole(['student', 'teacher']);