import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../services/auth.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { passwordRateLimiter } from '../middleware/security';
import { ApiError } from '../utils/ApiError';

const router = Router();
const authController = new AuthController();

// --- Zod Validation Schemas ---

const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .trim(),
});

const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255)
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required').max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required').max(2048),
});

const logoutSchema = z.object({
  refreshToken: z.string().max(2048).optional(),
});

// --- Routes ---

router.post('/register', passwordRateLimiter, async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(', '));
    }
    const { email, password, name } = parsed.data;
    const result = await authController.register(email, password, name);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', passwordRateLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(', '));
    }
    const { email, password } = parsed.data;
    const result = await authController.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid refresh token');
    }
    const { refreshToken } = parsed.data;
    const result = await authController.refreshTokens(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await authController.getMe(req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const parsed = logoutSchema.safeParse(req.body);
    const refreshToken = parsed.success ? parsed.data.refreshToken : undefined;
    await authController.logout(refreshToken);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
