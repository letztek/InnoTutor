import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../services/redis';
import { AppError } from './errorHandler';
import { ErrorCodes } from '../types';
import { logger } from '../utils/logger';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private message: string;
  private skipSuccessfulRequests: boolean;
  private skipFailedRequests: boolean;

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.message = options.message || 'Too many requests, please try again later';
    this.skipSuccessfulRequests = options.skipSuccessfulRequests || false;
    this.skipFailedRequests = options.skipFailedRequests || false;
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const redis = getRedisClient();
        const key = this.generateKey(req);
        const now = Date.now();
        const windowStart = now - this.windowMs;

        // Remove expired entries
        await redis.zRemRangeByScore(key, 0, windowStart);

        // Count current requests
        const currentRequests = await redis.zCard(key);

        if (currentRequests >= this.maxRequests) {
          logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method,
            currentRequests,
            maxRequests: this.maxRequests
          });

          throw new AppError(this.message, 429, ErrorCodes.SYSTEM_UNAVAILABLE);
        }

        // Add current request
        await redis.zAdd(key, { score: now, value: now.toString() });
        await redis.expire(key, Math.ceil(this.windowMs / 1000));

        // Add headers
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - currentRequests - 1));
        res.setHeader('X-RateLimit-Reset', new Date(now + this.windowMs));

        next();
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        
        logger.error('Rate limiter error:', error);
        // If Redis fails, allow the request to proceed
        next();
      }
    };
  }

  private generateKey(req: Request): string {
    // Use IP address and user ID (if authenticated) as key
    const userId = (req as any).user?.id || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `rate_limit:${ip}:${userId}`;
  }
}

// Pre-configured rate limiters for common use cases
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: '登入嘗試次數過多，請稍後再試'
});

export const generalRateLimiter = new RateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per 15 minutes
  message: '請求次數過多，請稍後再試'
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'API請求次數過多，請稍後再試'
});