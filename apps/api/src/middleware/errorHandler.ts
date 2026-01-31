import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AxiosError } from 'axios';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Known operational errors with safe messages
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  // Zod validation errors - safe to expose field details
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      statusCode: 400,
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma errors - map to safe client messages
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'A record with this value already exists',
          statusCode: 409,
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Record not found',
          statusCode: 404,
        });
      case 'P2003':
        return res.status(400).json({
          error: 'Related record not found',
          statusCode: 400,
        });
      default:
        console.error('Prisma error:', err.code, err.message);
        return res.status(500).json({
          error: 'Database operation failed',
          statusCode: 500,
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    console.error('Prisma validation error:', err.message);
    return res.status(400).json({
      error: 'Invalid data provided',
      statusCode: 400,
    });
  }

  // Axios errors from external API calls - never expose URLs or tokens
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    console.error('External API error:', {
      status,
      url: err.config?.url,
      message: err.message,
    });

    if (status === 401 || status === 403) {
      return res.status(502).json({
        error: 'Marketplace authentication failed',
        statusCode: 502,
      });
    }

    if (status === 429) {
      return res.status(429).json({
        error: 'Marketplace rate limit exceeded. Please try again later.',
        statusCode: 429,
      });
    }

    return res.status(502).json({
      error: 'External service request failed',
      statusCode: 502,
    });
  }

  // Catch JSON parse errors from malformed request bodies
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      statusCode: 400,
    });
  }

  // Unknown/unexpected errors - log full details, return safe message
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
  });
}
