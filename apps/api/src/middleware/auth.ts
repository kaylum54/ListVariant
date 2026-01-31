import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';

export interface AuthRequest extends Request {
  userId?: string;
}

// Pin the JWT algorithm to prevent algorithm confusion attacks (e.g., alg:none, RS256/HS256 swap)
const JWT_VERIFY_OPTIONS: jwt.VerifyOptions = {
  algorithms: ['HS256'],
  maxAge: '15m', // Reject tokens older than 15 minutes even if exp is manipulated
};

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = authHeader.split(' ')[1];

  if (!token || token.length > 2048) {
    throw new ApiError(401, 'Invalid token format');
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret, JWT_VERIFY_OPTIONS) as { userId: string };

    if (!payload.userId || typeof payload.userId !== 'string') {
      throw new ApiError(401, 'Invalid token payload');
    }

    req.userId = payload.userId;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid or expired token');
  }
}
