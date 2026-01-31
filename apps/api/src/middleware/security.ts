import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// --- Rate Limiters ---

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  // Use X-Forwarded-For when behind a proxy, but validate it exists
  keyGenerator: (req) => {
    return (req.ip || req.socket.remoteAddress || 'unknown');
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req.ip || req.socket.remoteAddress || 'unknown');
  },
});

// Stricter rate limiter for password-related operations (login, register)
export const passwordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req.ip || req.socket.remoteAddress || 'unknown');
  },
});

// --- CSRF Protection ---

/**
 * CSRF protection for state-changing requests (POST, PUT, PATCH, DELETE).
 *
 * Since this is a Bearer-token API (not cookie-auth), CSRF risk is lower.
 * However, we add an Origin/Referer check as defense-in-depth for any
 * routes that might be reached via browser forms or fetch with credentials.
 *
 * Requests with a valid Bearer token in the Authorization header are exempt
 * because CSRF attacks cannot set custom headers from cross-origin forms.
 */
export function csrfProtection(allowedOrigins: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Only check state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Requests with Bearer tokens are inherently CSRF-safe
    // (browsers cannot set Authorization headers from cross-origin forms)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return next();
    }

    // For requests without Bearer tokens, validate Origin or Referer
    const origin = req.headers.origin;
    const referer = req.headers.referer;

    if (origin) {
      if (allowedOrigins.includes(origin) || origin.startsWith('chrome-extension://')) {
        return next();
      }
      return _res.status(403).json({ error: 'Forbidden: Invalid origin' });
    }

    if (referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (allowedOrigins.includes(refererOrigin)) {
          return next();
        }
      } catch {
        // Invalid referer URL
      }
      return _res.status(403).json({ error: 'Forbidden: Invalid referer' });
    }

    // No origin or referer on a state-changing request without Bearer token
    // This blocks cross-origin form submissions while allowing API clients
    // that include Authorization headers
    return _res.status(403).json({ error: 'Forbidden: Missing origin header' });
  };
}

// --- Input Sanitization ---

/**
 * Basic XSS sanitization middleware.
 * Strips or encodes dangerous HTML/script patterns from string values in
 * req.body, req.query, and req.params.
 *
 * This supplements Zod validation (which handles type/shape) with output-encoding
 * as defense-in-depth against stored XSS.
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '') // Strip event handlers like onclick=, onerror=
      .replace(/data:\s*text\/html/gi, ''); // Strip data:text/html URIs
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    return sanitizeObject(value as Record<string, unknown>);
  }
  return value;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeValue(value);
  }
  return sanitized;
}

export function inputSanitizer(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query as Record<string, unknown>) as typeof req.query;
  }
  next();
}

// --- Security Headers ---

/**
 * Additional security headers beyond what helmet provides.
 */
export function additionalSecurityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Prevent browsers from MIME-sniffing (helmet sets this, but belt-and-suspenders)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Enable XSS filter in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Prevent referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict permissions
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  next();
}
