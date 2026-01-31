import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '@tom-flips/database';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';

// Pin JWT signing/verification algorithms to prevent algorithm confusion attacks
const JWT_SIGN_OPTIONS: jwt.SignOptions = { algorithm: 'HS256' };
const REFRESH_VERIFY_OPTIONS: jwt.VerifyOptions = {
  algorithms: ['HS256'],
  maxAge: '7d',
};

/**
 * In-memory refresh token revocation set.
 *
 * SECURITY NOTE: This is an in-memory blocklist for revoked refresh tokens.
 * It provides revocation capability but is cleared on server restart.
 * For production, this SHOULD be replaced with a Redis set or a database table
 * (e.g., a RefreshToken model in Prisma) for persistence across restarts.
 *
 * Tokens are stored as SHA-256 hashes to avoid holding raw tokens in memory.
 * Entries auto-expire after 7 days (matching refresh token lifetime).
 */
const revokedTokenHashes = new Map<string, number>(); // hash -> expiry timestamp

// Clean up expired entries every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [hash, expiry] of revokedTokenHashes) {
    if (now > expiry) {
      revokedTokenHashes.delete(hash);
    }
  }
}, 10 * 60 * 1000).unref(); // .unref() so this doesn't prevent process exit

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function isTokenRevoked(token: string): boolean {
  const hash = hashToken(token);
  const expiry = revokedTokenHashes.get(hash);
  if (expiry === undefined) return false;
  if (Date.now() > expiry) {
    revokedTokenHashes.delete(hash);
    return false;
  }
  return true;
}

function revokeToken(token: string): void {
  const hash = hashToken(token);
  // Keep in blocklist for 7 days (refresh token lifetime)
  const expiryMs = Date.now() + 7 * 24 * 60 * 60 * 1000;
  revokedTokenHashes.set(hash, expiryMs);
}

export class AuthController {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(400, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const tokens = this.generateTokens(user.id);

    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Perform a dummy bcrypt comparison to prevent timing attacks that reveal
      // whether an email exists in the system
      await bcrypt.compare(password, '$2a$12$000000000000000000000uGSHMGTOagOSBuoFkkCzPONGimHOiGy');
      throw new ApiError(401, 'Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const tokens = this.generateTokens(user.id);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  generateTokens(userId: string) {
    const jti = crypto.randomUUID(); // Unique token ID for revocation tracking
    const accessToken = jwt.sign({ userId }, config.jwtSecret, {
      ...JWT_SIGN_OPTIONS,
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ userId, jti }, config.jwtRefreshSecret, {
      ...JWT_SIGN_OPTIONS,
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.length > 2048) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // Check if this token has been revoked (e.g., by logout or prior rotation)
    if (isTokenRevoked(refreshToken)) {
      throw new ApiError(401, 'Refresh token has been revoked');
    }

    try {
      const payload = jwt.verify(refreshToken, config.jwtRefreshSecret, REFRESH_VERIFY_OPTIONS) as {
        userId: string;
        jti?: string;
      };

      if (!payload.userId || typeof payload.userId !== 'string') {
        throw new ApiError(401, 'Invalid refresh token payload');
      }

      // Revoke the old refresh token (rotation) to prevent replay attacks
      revokeToken(refreshToken);

      return this.generateTokens(payload.userId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  /**
   * Revoke a refresh token on logout so it cannot be reused.
   */
  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken && typeof refreshToken === 'string') {
      revokeToken(refreshToken);
    }
  }
}
