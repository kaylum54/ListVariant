import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  condition: z.enum(['new', 'used_like_new', 'used_good', 'used_fair']),
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

export const updateListingSchema = createListingSchema.partial();

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
