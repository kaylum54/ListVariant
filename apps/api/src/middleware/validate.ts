import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

interface ValidateSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Validate request body against a Zod schema.
 * Can accept a single schema (for body) or an object with body/params/query schemas.
 */
export function validate(schema: ZodSchema | ValidateSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if ('parse' in schema) {
        // Single schema - validate body (backwards compatible)
        req.body = schema.parse(req.body);
      } else {
        // Multiple schemas - validate each provided source
        if (schema.params) {
          req.params = schema.params.parse(req.params) as typeof req.params;
        }
        if (schema.query) {
          req.query = schema.query.parse(req.query) as typeof req.query;
        }
        if (schema.body) {
          req.body = schema.body.parse(req.body);
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
