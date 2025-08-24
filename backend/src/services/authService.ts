import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { ErrorCodes } from '../types';
import { logger } from '../utils/logger';
import { getRedisClient } from './redis';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
  grade?: number;
  subjects?: string[];
  teachingExperience?: number;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'teacher';
  };
  token: string;
  expiresIn: string;
}

export class AuthService {
  private static generateToken(payload: { userId: string; email: string; role: string }): string {
    const jwtSecret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', 500, ErrorCodes.SYSTEM_UNAVAILABLE);
    }

    return jwt.sign(payload, jwtSecret, { expiresIn });
  }

  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password } = credentials;
    
    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401, ErrorCodes.UNAUTHORIZED);
    }

    // Validate password
    const isValidPassword = await UserModel.validatePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401, ErrorCodes.UNAUTHORIZED);
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
  }

  static async register(registerData: RegisterData): Promise<AuthResult> {
    const { email, password, name, role, grade, subjects, teachingExperience } = registerData;
    
    // Check if email already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 400, ErrorCodes.INVALID_INPUT);
    }

    // Validate password strength
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400, ErrorCodes.INVALID_INPUT);
    }

    // Create user
    const user = await UserModel.createUser({
      email,
      password,
      name,
      role
    });

    // Create role-specific profile
    if (role === 'student') {
      const studentId = await UserModel.generateUniqueStudentId();
      await UserModel.createStudent(user.id, {
        studentId,
        grade: grade || 1
      });
    } else if (role === 'teacher') {
      const teacherId = await UserModel.generateUniqueTeacherId();
      await UserModel.createTeacher(user.id, {
        teacherId,
        subjects: subjects || [],
        teachingExperience: teachingExperience || 0
      });
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
  }

  static async logout(token: string): Promise<void> {
    try {
      const redis = getRedisClient();
      
      // Extract token expiration time
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        const expirationTime = decoded.exp - Math.floor(Date.now() / 1000);
        
        // Add token to blacklist
        if (expirationTime > 0) {
          await redis.setEx(`blacklist:${token}`, expirationTime, 'true');
        }
      }

      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout error:', error);
      // Don't throw error for logout failures
    }
  }

  static async validateToken(token: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      
      // Check if token is blacklisted
      const isBlacklisted = await redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return false;
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new AppError('JWT secret not configured', 500, ErrorCodes.SYSTEM_UNAVAILABLE);
      }

      jwt.verify(token, jwtSecret);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getCurrentUser(userId: string): Promise<any> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, ErrorCodes.INVALID_INPUT);
    }

    if (user.role === 'student') {
      return await UserModel.getStudentProfile(userId);
    } else if (user.role === 'teacher') {
      return await UserModel.getTeacherProfile(userId);
    }

    return user;
  }
}