import { Router, Request, Response } from 'express';
import selectorsConfig from '../config/selectors.json';

const router = Router();

/**
 * GET /api/config/selectors
 *
 * Returns the current selector configuration for all platforms.
 * Public endpoint — no auth required.
 *
 * Query params:
 *   ?v=<version> — if the version matches the current config, returns 304 Not Modified.
 */
router.get('/selectors', (req: Request, res: Response) => {
  const clientVersion = req.query.v as string | undefined;

  if (clientVersion && clientVersion === selectorsConfig.version) {
    res.status(304).end();
    return;
  }

  res.json(selectorsConfig);
});

export default router;
