# Tom Flips

Cross-listing platform for furniture resellers. List items once, publish to 7 marketplaces.

## Supported Marketplaces

| Platform | Integration | Method |
|----------|------------|--------|
| eBay | API (OAuth) | REST API |
| Etsy | API (OAuth + PKCE) | REST API |
| Facebook Marketplace | Browser automation | Chrome Extension |
| Gumtree | Browser automation | Chrome Extension |
| Vinted | Browser automation | Chrome Extension |
| Depop | Browser automation | Chrome Extension |
| Poshmark | Browser automation | Chrome Extension |

## Architecture

Turborepo monorepo with three applications and one shared package:

```
tom-flips/
  apps/
    api/          Express.js API (port 4000)
    web/          Next.js frontend (port 3000)
    extension/    Chrome Extension (MV3)
  packages/
    database/     Prisma client (@tom-flips/database)
  docs/
    architecture/ ADR documents
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Start database (Docker)
docker compose up postgres redis -d

# 4. Push database schema
cd packages/database && npx prisma db push && cd ../..

# 5. Start development servers
npm run dev

# 6. Build Chrome extension
cd apps/extension && node build.mjs
```

The web app runs at `http://localhost:3000` and the API at `http://localhost:4000`.

## Chrome Extension

The extension automates listing creation on browser-based marketplaces. After building:

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select `apps/extension/dist`
4. Log in to the Tom Flips web app
5. The extension picks up your auth token automatically

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection (optional, improves performance)
- `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` — eBay API credentials
- `ETSY_CLIENT_ID` / `ETSY_CLIENT_SECRET` — Etsy API credentials

## Docker

```bash
# Full stack
docker compose up

# Just infrastructure
docker compose up postgres redis -d
```

## Documentation

- [ADR-001: Monorepo](docs/architecture/ADR-001-monorepo.md)
- [ADR-002: PostgreSQL + Prisma](docs/architecture/ADR-002-postgresql-prisma.md)
- [ADR-003: JWT Authentication](docs/architecture/ADR-003-jwt-auth.md)
- [ADR-004: Browser Automation](docs/architecture/ADR-004-browser-automation.md)
- [ADR-005: Image Pre-fetch](docs/architecture/ADR-005-image-prefetch.md)
