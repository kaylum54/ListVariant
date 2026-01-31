import { Router } from 'express';
import { ListingsService } from '../services/listings.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createListingSchema, updateListingSchema } from '../schemas/listing.schema';
import { upload } from '../middleware/upload';

const router = Router();
const listingsService = new ListingsService();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, page, limit, search } = req.query;
    const result = await listingsService.getAll(req.userId!, {
      status: status as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  upload.array('images', 10),
  (req: AuthRequest, _res, next) => {
    // Coerce FormData string values to proper types for Zod validation
    if (req.body.price) req.body.price = parseFloat(req.body.price);
    if (req.body.costPrice) req.body.costPrice = parseFloat(req.body.costPrice);
    if (req.body.dimensionsLengthCm)
      req.body.dimensionsLengthCm = parseInt(req.body.dimensionsLengthCm);
    if (req.body.dimensionsWidthCm)
      req.body.dimensionsWidthCm = parseInt(req.body.dimensionsWidthCm);
    if (req.body.dimensionsHeightCm)
      req.body.dimensionsHeightCm = parseInt(req.body.dimensionsHeightCm);
    next();
  },
  validate(createListingSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const files = req.files as Express.Multer.File[];
      const result = await listingsService.create(req.userId!, req.body, files);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await listingsService.getById(req.params.id, req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validate(updateListingSchema), async (req: AuthRequest, res, next) => {
  try {
    const result = await listingsService.update(req.params.id, req.userId!, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await listingsService.delete(req.params.id, req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
