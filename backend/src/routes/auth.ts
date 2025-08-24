import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { ErrorCodes } from '../types';

const router = Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '請提供有效的電子信箱',
    'any.required': '電子信箱為必填項目'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '密碼長度至少需要6個字元',
    'any.required': '密碼為必填項目'
  })
});

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '請提供有效的電子信箱',
    'any.required': '電子信箱為必填項目'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '密碼長度至少需要6個字元',
    'any.required': '密碼為必填項目'
  }),
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': '姓名長度至少需要2個字元',
    'string.max': '姓名長度不能超過50個字元',
    'any.required': '姓名為必填項目'
  }),
  role: Joi.string().valid('student', 'teacher').required().messages({
    'any.only': '角色必須是學生或教師',
    'any.required': '角色為必填項目'
  }),
  grade: Joi.when('role', {
    is: 'student',
    then: Joi.number().integer().min(1).max(12),
    otherwise: Joi.forbidden()
  }),
  subjects: Joi.when('role', {
    is: 'teacher',
    then: Joi.array().items(Joi.string()).min(1),
    otherwise: Joi.forbidden()
  }),
  teachingExperience: Joi.when('role', {
    is: 'teacher',
    then: Joi.number().integer().min(0).max(50),
    otherwise: Joi.forbidden()
  })
});

// User registration
router.post('/register', asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400, ErrorCodes.INVALID_INPUT);
  }

  const result = await AuthService.register(value);

  res.status(201).json({
    success: true,
    data: result,
    message: '註冊成功',
    timestamp: new Date()
  });
}));

// User login
router.post('/login', asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400, ErrorCodes.INVALID_INPUT);
  }

  const result = await AuthService.login(value);

  res.json({
    success: true,
    data: result,
    message: '登入成功',
    timestamp: new Date()
  });
}));

// User logout
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    await AuthService.logout(token);
  }

  res.json({
    success: true,
    message: '登出成功',
    timestamp: new Date()
  });
}));

// Get current user
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('User not found', 404, ErrorCodes.UNAUTHORIZED);
  }

  const user = await AuthService.getCurrentUser(req.user.id);

  res.json({
    success: true,
    data: user,
    timestamp: new Date()
  });
}));

// Token validation endpoint
router.post('/validate', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw new AppError('Token required', 400, ErrorCodes.INVALID_INPUT);
  }

  const isValid = await AuthService.validateToken(token);

  res.json({
    success: true,
    data: { valid: isValid },
    timestamp: new Date()
  });
}));

module.exports = router;