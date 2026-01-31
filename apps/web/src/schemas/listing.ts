import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  condition: z.enum(['new', 'used_like_new', 'used_good', 'used_fair'], {
    required_error: 'Please select a condition',
  }),
  brand: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  dimensionsLengthCm: z.number().positive().optional(),
  dimensionsWidthCm: z.number().positive().optional(),
  dimensionsHeightCm: z.number().positive().optional(),
  sku: z.string().optional(),
  costPrice: z.number().positive().optional(),
  notes: z.string().optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
