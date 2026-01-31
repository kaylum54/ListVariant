import { Router } from 'express';
import { prisma } from '@tom-flips/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { EbayService } from '../services/ebay.service';
import { EtsyService } from '../services/marketplace/etsy.service';

const router = Router();

router.use(authenticate);

// Get all connections for the current user
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const connections = await prisma.marketplaceConnection.findMany({
      where: { userId: req.userId! },
    });
    res.json(connections);
  } catch (error) {
    next(error);
  }
});

// Connect a marketplace (for extension-based marketplaces like Facebook/Gumtree)
router.post('/:marketplace/connect', async (req: AuthRequest, res, next) => {
  try {
    const { marketplace } = req.params;
    const validMarketplaces = ['ebay', 'facebook', 'gumtree', 'etsy', 'vinted', 'depop', 'poshmark'];
    if (!validMarketplaces.includes(marketplace)) {
      return res.status(400).json({ error: 'Invalid marketplace' });
    }

    const connection = await prisma.marketplaceConnection.upsert({
      where: {
        userId_marketplace: {
          userId: req.userId!,
          marketplace,
        },
      },
      update: {
        status: 'connected',
      },
      create: {
        userId: req.userId!,
        marketplace,
        status: 'connected',
      },
    });

    res.json(connection);
  } catch (error) {
    next(error);
  }
});

// Disconnect a marketplace
router.post('/:marketplace/disconnect', async (req: AuthRequest, res, next) => {
  try {
    const { marketplace } = req.params;

    const connection = await prisma.marketplaceConnection.findUnique({
      where: {
        userId_marketplace: {
          userId: req.userId!,
          marketplace,
        },
      },
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    await prisma.marketplaceConnection.delete({
      where: { id: connection.id },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// eBay OAuth flow
router.get('/ebay/auth-url', async (req: AuthRequest, res, next) => {
  try {
    const ebayService = new EbayService(req.userId!);
    const url = await ebayService.getAuthUrl();
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

router.get('/ebay/callback', async (req: AuthRequest, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }
    const ebayService = new EbayService(req.userId!);
    await ebayService.handleCallback(code as string, state as string);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Etsy OAuth flow
router.get('/etsy/auth-url', async (req: AuthRequest, res, next) => {
  try {
    const etsyService = new EtsyService(req.userId!);
    const url = await etsyService.getAuthUrl();
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

router.get('/etsy/callback', async (req: AuthRequest, res, next) => {
  try {
    const { code, state } = req.query;
    const etsyService = new EtsyService(req.userId!);
    await etsyService.handleCallback(code as string, state as string);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
