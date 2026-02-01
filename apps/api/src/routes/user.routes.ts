import { Router } from 'express';
import { prisma } from '@syncsellr/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// GET /api/users/onboarding - Get onboarding state
router.get('/onboarding', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { onboardingCompletedAt: true, crossListReminders: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      isComplete: !!user.onboardingCompletedAt,
      completedAt: user.onboardingCompletedAt,
      crossListReminders: user.crossListReminders || {},
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/onboarding/complete - Mark onboarding as complete
router.post('/onboarding/complete', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { onboardingCompletedAt: new Date() },
      select: { onboardingCompletedAt: true },
    });

    res.json({ success: true, completedAt: user.onboardingCompletedAt });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/preferences - Update cross-list reminder preferences
router.patch('/preferences', async (req: AuthRequest, res, next) => {
  try {
    const { crossListReminders } = req.body;

    if (crossListReminders && typeof crossListReminders !== 'object') {
      return res.status(400).json({ error: 'crossListReminders must be an object' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { crossListReminders: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Merge with existing preferences
    const existing = (user.crossListReminders as Record<string, boolean>) || {};
    const merged = { ...existing, ...crossListReminders };

    const updated = await prisma.user.update({
      where: { id: req.userId! },
      data: { crossListReminders: merged },
      select: { crossListReminders: true },
    });

    res.json({ success: true, crossListReminders: updated.crossListReminders });
  } catch (error) {
    next(error);
  }
});

export default router;
