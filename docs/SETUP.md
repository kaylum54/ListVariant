# Tom Flips -- Developer Setup Guide

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 11+ (ships with Node 22+; earlier versions work too)
- **Docker** and **Docker Compose** (for PostgreSQL and Redis)
- **Git**

Optional:
- **Chrome** or Chromium-based browser (for the extension)

---

## 1. Clone the Repository

```bash
git clone https://github.com/kaylum54/tom-flips.git
cd tom-flips
```

---

## 2. Install Dependencies

From the repository root:

```bash
npm install
```

This installs dependencies for all workspaces (`apps/api`, `apps/web`, `apps/extension`, and all `packages/*`).

---

## 3. Start Infrastructure (PostgreSQL + Redis)

```bash
docker compose up -d postgres redis
```

This starts:
- **PostgreSQL 15** on port `5432` (user: `tomflips`, password: `tomflips_dev`, db: `tomflips`)
- **Redis 7** on port `6379`

Verify they are running:

```bash
docker compose ps
```

---

## 4. Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

The defaults in `.env.example` work for local development. Edit `.env` to add marketplace API credentials if you need eBay or Etsy integration.

### Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql://tomflips:tomflips_dev@localhost:5432/tomflips` | PostgreSQL connection string |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis URL (app works without it) |
| `JWT_SECRET` | Yes | template value | Secret for signing access tokens. Use 32+ random chars in production |
| `JWT_REFRESH_SECRET` | Yes | template value | Secret for signing refresh tokens. Use 32+ random chars in production |
| `PORT` | No | `4000` | API server port |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Web app URL (used by the frontend) |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:4000` | API URL (used by the frontend) |
| `API_URL` | No | `http://localhost:4000` | API URL (used server-side) |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated allowed origins |
| `EBAY_CLIENT_ID` | No | empty | eBay developer app Client ID |
| `EBAY_CLIENT_SECRET` | No | empty | eBay developer app Client Secret |
| `EBAY_REDIRECT_URI` | No | `http://localhost:3000/connections?ebay_connected=true` | eBay OAuth redirect |
| `EBAY_API_URL` | No | `https://api.ebay.com` | eBay API base URL |
| `ETSY_CLIENT_ID` | No | empty | Etsy developer app Client ID |
| `ETSY_CLIENT_SECRET` | No | empty | Etsy developer app Client Secret |
| `ETSY_REDIRECT_URI` | No | `http://localhost:3000/connections?etsy_connected=true` | Etsy OAuth redirect |
| `AWS_ACCESS_KEY_ID` | No | empty | For cloud image storage (optional) |
| `AWS_SECRET_ACCESS_KEY` | No | empty | For cloud image storage (optional) |
| `AWS_BUCKET_NAME` | No | empty | S3 bucket name |
| `AWS_REGION` | No | empty | AWS region |

---

## 5. Generate Prisma Client and Push Schema

```bash
npm run db:generate
npm run db:push
```

- `db:generate` generates the typed Prisma Client from `packages/database/prisma/schema.prisma`.
- `db:push` applies the schema to your local PostgreSQL database.

To browse your database interactively:

```bash
cd packages/database && npx prisma studio
```

---

## 6. Start the Dev Servers

From the repository root:

```bash
npm run dev
```

This uses Turborepo to start all apps in parallel:

| App | URL | Description |
|-----|-----|-------------|
| API | `http://localhost:4000` | Express backend |
| Web | `http://localhost:3000` | Next.js frontend |
| Extension | N/A | Watches and rebuilds to `apps/extension/dist/` |

---

## 7. Load the Chrome Extension

See [docs/EXTENSION.md](./EXTENSION.md) for detailed instructions.

Quick version:
1. Run `npm run build --workspace=@tom-flips/extension` (or let `npm run dev` handle it)
2. Open `chrome://extensions` and enable Developer Mode
3. Click "Load unpacked" and select `apps/extension/dist/`

---

## Project Structure

```
tom-flips/
├── apps/
│   ├── api/              Express.js backend (port 4000)
│   │   ├── src/
│   │   │   ├── routes/         auth, listing, connection routes
│   │   │   ├── services/       business logic (listings, eBay, Etsy, marketplace registry)
│   │   │   ├── middleware/     auth, validation, rate limiting, security
│   │   │   ├── schemas/       Zod validation schemas
│   │   │   ├── config/        environment config
│   │   │   ├── jobs/          BullMQ workers (marketplace sync)
│   │   │   ├── lib/           Redis, logger, circuit breaker
│   │   │   └── utils/         ApiError class
│   │   └── public/uploads/    Uploaded listing images
│   ├── web/              Next.js frontend (port 3000)
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/          login, register pages
│   │       │   └── (dashboard)/     dashboard, listings, connections, settings
│   │       ├── components/    sections, icons, hero animation
│   │       ├── hooks/         useAuth, useListings
│   │       ├── lib/           axios API client
│   │       └── schemas/       client-side Zod schemas
│   └── extension/        Chrome Extension (Manifest V3)
│       ├── src/
│       │   ├── background/    service worker (auth, cross-list orchestration)
│       │   ├── content/       per-platform content scripts (facebook, gumtree, vinted, depop, poshmark)
│       │   ├── popup/         extension popup UI
│       │   └── lib/           API client, storage, AutomationFramework
│       └── dist/              built extension (load this in Chrome)
├── packages/
│   ├── database/         Prisma schema + client (@tom-flips/database)
│   ├── shared/           Shared types and utilities (@tom-flips/shared)
│   └── ui/               Shared UI components (@tom-flips/ui)
├── docs/                 Documentation and ADRs
├── docker-compose.yml    PostgreSQL + Redis + full stack
├── turbo.json            Turborepo task config
└── package.json          Root workspace config
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps for production |
| `npm run type-check` | Run TypeScript type checking across all packages |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run clean` | Remove all build artifacts and node_modules |

---

## Docker (Full Stack)

To run the entire stack in Docker:

```bash
docker compose up --build
```

This starts the API, web frontend, PostgreSQL, and Redis. The API builds from `apps/api/Dockerfile` and the web app from `apps/web/Dockerfile`.

---

## Troubleshooting

**"Missing required environment variable: JWT_SECRET"**
Make sure you copied `.env.example` to `.env` at the repository root.

**Prisma Client not found / import errors**
Run `npm run db:generate` to regenerate the Prisma Client.

**Port 4000 or 3000 already in use**
Change the `PORT` variable in `.env`, or stop the conflicting process.

**Database connection refused**
Make sure PostgreSQL is running: `docker compose up -d postgres`.

**Extension not loading**
Make sure you built the extension first (`npm run build --workspace=@tom-flips/extension`) and loaded the `apps/extension/dist/` directory in Chrome.
