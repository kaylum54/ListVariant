import { Router } from 'express';
import authRoutes from './auth.routes';
import listingRoutes from './listing.routes';
import connectionRoutes from './connection.routes';
import configRoutes from './config.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/connections', connectionRoutes);
router.use('/config', configRoutes);
router.use('/users', userRoutes);

export default router;
