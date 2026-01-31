import { Router } from 'express';
import authRoutes from './auth.routes';
import listingRoutes from './listing.routes';
import connectionRoutes from './connection.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/connections', connectionRoutes);

export default router;
