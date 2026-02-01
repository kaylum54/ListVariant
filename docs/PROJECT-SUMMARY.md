# Project Summary: SyncSellr

**Generated:** January 31, 2026
**Summary Type:** Checkpoint
**Repository:** https://github.com/kaylum54/ListVariant

---

## 1. Project Overview

### What This Project Is
SyncSellr is a cross-listing platform for furniture resellers. Users create a product listing once — with title, description, price, images, and condition — and the platform publishes it to up to 7 online marketplaces simultaneously. Two platforms (eBay, Etsy) use API integrations with OAuth; five platforms (Facebook Marketplace, Gumtree, Vinted, Depop, Poshmark) use browser automation via a Chrome extension that fills in listing forms automatically.

The project is a Turborepo monorepo containing an Express API backend, a Next.js frontend, a Chrome MV3 extension, and shared packages for database access, types, and UI components.

### Target Users
UK-based furniture resellers who buy wholesale or secondhand furniture and resell across multiple marketplaces. The tool eliminates the manual process of creating the same listing on each platform individually.

### Current Status
**Active Development** — Core architecture complete, all 7 marketplace integrations scaffolded, security hardened, but not yet deployed to production. No real marketplace API credentials configured yet (placeholder values in `.env`).

---

## 2. Tech Stack

### Core Technologies
| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Next.js 14, React 18, TailwindCSS | Landing page + dashboard |
| Backend | Express.js 4, TypeScript | REST API on port 4000 |
| Database | PostgreSQL 15, Prisma ORM | Via `@syncsellr/database` shared package |
| Extension | Chrome MV3, Vite | Background service worker + content scripts |
| Monorepo | Turborepo, npm workspaces | Build orchestration and caching |
| State | Zustand (frontend), React Query | Server state + client state |
| Auth | JWT (access + refresh tokens), bcryptjs | Custom implementation, no third-party auth |
| Queue | BullMQ + Redis (optional) | Background job processing |

### Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | API framework |
| next | ^14.2.0 | Frontend framework |
| prisma | (client) | Database ORM |
| jsonwebtoken | ^9.0.2 | JWT auth |
| bullmq | ^5.67.2 | Job queue |
| ioredis | ^5.9.2 | Redis client |
| axios | ^1.6.5 | HTTP client (API + Etsy/eBay) |
| zod | ^3.22.4 | Schema validation |
| express-rate-limit | ^8.2.1 | Rate limiting |
| helmet | ^7.1.0 | Security headers |
| framer-motion | ^12.29.2 | Landing page animations |
| lucide-react | ^0.344.0 | Icons |

### Development Tools
| Tool | Purpose |
|------|---------|
| Turborepo ^2.3.0 | Monorepo task orchestration |
| TypeScript ^5.3.3 | Type safety across all apps |
| Vite ^5.4.21 | Extension build (IIFE content scripts) |
| tsx ^4.7.0 | API dev server |
| Docker Compose | PostgreSQL + Redis infrastructure |

---

## 3. Architecture Overview

### High-Level Structure
Turborepo monorepo with 3 applications and 3 shared packages. The API serves as the central backend; the web app is the user-facing frontend; the extension automates browser-based marketplace listings.

```
User → Web App (Next.js :3000) → API (Express :4000) → PostgreSQL
                                     ↓
                              Chrome Extension
                                     ↓
                    Facebook / Gumtree / Vinted / Depop / Poshmark
                              (browser automation)

User → Web App → API → eBay API / Etsy API (OAuth)
```

### Key Patterns
- **MarketplaceAdapter interface** — Shared contract for API-based platforms (`apps/api/src/services/marketplace/types.ts`)
- **AutomationFramework base class** — Template method pattern for browser automation (`apps/extension/src/lib/automation/AutomationFramework.ts`)
- **Image pre-fetch in service worker** — Background script fetches images via `arrayBuffer()` + `btoa()` (no `FileReader` in service workers), passes as `dataUrl` to content scripts to avoid CORS
- **Circuit breaker** — Wraps external API calls (eBay, Etsy) with CLOSED/OPEN/HALF_OPEN states (`apps/api/src/lib/circuitBreaker.ts`)
- **Platform registry** — TTL-cached adapter lookup per user (`apps/api/src/services/marketplace/registry.ts`)
- **Zod validation** — All auth routes validate input with Zod schemas
- **Rate limiting** — Auth endpoints (5/min), password attempts (10/15min), general API (100/min)

### Data Flow
1. User creates listing in web app (title, description, price, images, condition)
2. Web app POSTs to API → saved to PostgreSQL via Prisma
3. User clicks "Cross-list to Facebook" in the listing detail page
4. Web app sends `CROSS_LIST` message to Chrome extension background script
5. Background script fetches full listing + pre-fetches images as data URLs
6. Background script opens marketplace tab, waits for load, sends `CREATE_LISTING` message
7. Content script receives message, fills form fields, attaches images
8. Content script reports success/failure back to background → API

### File Structure
```
syncsellr/
├── apps/
│   ├── api/                    Express.js API (port 4000)
│   │   ├── src/
│   │   │   ├── config/         Environment & platform config
│   │   │   ├── jobs/           BullMQ queue + workers
│   │   │   ├── lib/            CircuitBreaker, Redis, Logger
│   │   │   ├── middleware/     Auth, security, validation, error handler
│   │   │   ├── routes/         Auth, listings, connections
│   │   │   ├── schemas/        Zod validation schemas
│   │   │   ├── services/       Auth, listings, eBay, marketplace/
│   │   │   └── utils/          ApiError class
│   │   └── Dockerfile
│   ├── web/                    Next.js frontend (port 3000)
│   │   └── src/
│   │       ├── app/            Pages (auth, dashboard, listings, connections, settings)
│   │       ├── components/     Landing page sections, icons, hero animation
│   │       ├── hooks/          useAuth, useListings
│   │       ├── lib/            API client
│   │       └── schemas/        Frontend Zod schemas
│   └── extension/              Chrome Extension (MV3)
│       ├── src/
│       │   ├── background/     Service worker (message routing, image pre-fetch)
│       │   ├── content/        facebook.ts, gumtree.ts, vinted.ts, depop.ts, poshmark.ts
│       │   ├── lib/            AutomationFramework, API client, storage
│       │   ├── popup/          Extension popup UI
│       │   └── utils/          DOM helpers, delay utilities
│       └── build.mjs           Custom Vite build (IIFE content scripts)
├── packages/
│   ├── database/               Prisma client (@syncsellr/database)
│   ├── shared/                 Shared types & utils (@syncsellr/shared)
│   └── ui/                     Shared React components (@syncsellr/ui)
├── docs/
│   ├── architecture/           ADR-001 through ADR-005
│   ├── API.md                  API endpoint documentation
│   ├── SETUP.md                Setup guide
│   └── EXTENSION.md            Extension documentation
├── docker-compose.yml          PostgreSQL + Redis + API
├── turbo.json                  Turborepo config
└── .env.example                All environment variables
```

---

## 4. Features

### Completed Features
| Feature | Description | Location |
|---------|-------------|----------|
| User auth (register/login/logout) | JWT access + refresh tokens, bcrypt passwords | `apps/api/src/routes/auth.routes.ts` |
| Listing CRUD | Create, read, update, delete listings with images | `apps/api/src/routes/listing.routes.ts` |
| Image upload | Multer-based local file upload | `apps/api/src/middleware/upload.ts` |
| Marketplace connections | Connect/disconnect per platform | `apps/api/src/routes/connection.routes.ts` |
| eBay OAuth flow | Full OAuth 2.0 with token refresh | `apps/api/src/services/ebay.service.ts` |
| Etsy OAuth flow | OAuth 2.0 + PKCE | `apps/api/src/services/marketplace/etsy.service.ts` |
| Facebook automation | Content script for Marketplace listing creation | `apps/extension/src/content/facebook.ts` |
| Gumtree automation | Content script for post-ad flow | `apps/extension/src/content/gumtree.ts` |
| Vinted automation | AutomationFramework-based listing creation | `apps/extension/src/content/vinted.ts` |
| Depop automation | AutomationFramework-based listing creation | `apps/extension/src/content/depop.ts` |
| Poshmark automation | AutomationFramework-based listing creation | `apps/extension/src/content/poshmark.ts` |
| Landing page | Animated marketing page with pricing, features, FAQ | `apps/web/src/app/page.tsx` |
| Dashboard | Listing management UI | `apps/web/src/app/(dashboard)/` |
| Connections page | 7-platform connection management | `apps/web/src/app/(dashboard)/connections/page.tsx` |
| Security middleware | Rate limiting, CSRF, input sanitization, security headers | `apps/api/src/middleware/security.ts` |
| Circuit breaker | External API call protection | `apps/api/src/lib/circuitBreaker.ts` |
| Structured logging | JSON logger with error serialization | `apps/api/src/lib/logger.ts` |
| Graceful shutdown | Prisma + Redis + BullMQ cleanup | `apps/api/src/index.ts` |
| Auth bridge | Extension picks up auth token from web app | `apps/extension/src/content/auth-bridge.ts` |

### In Progress
| Feature | Status | Blockers | Location |
|---------|--------|----------|----------|
| eBay publish listing | Scaffolded, implements MarketplaceAdapter | Needs real API credentials | `apps/api/src/services/ebay.service.ts` |
| Etsy publish listing | Scaffolded | Needs real API credentials | `apps/api/src/services/marketplace/etsy.service.ts` |
| Marketplace sync worker | Scaffolded, handles status sync | Needs running Redis + real credentials | `apps/api/src/jobs/workers/marketplace-sync.worker.ts` |

### Planned / Not Started
| Feature | Priority | Dependencies |
|---------|----------|--------------|
| Test suite | HIGH | None |
| Cloud image storage (S3) | MEDIUM | AWS credentials |
| Sale tracking & profit reports | MEDIUM | Working marketplace integrations |
| Wholesale catalog import | LOW | Listing CRUD complete |
| Email notifications | LOW | Email service setup |
| Production deployment | HIGH | Real credentials, Docker, hosting |

---

## 5. Current State of Code

### What's Working
- API starts and serves all endpoints (auth, listings, connections)
- PostgreSQL schema synced with 8 models and proper indices
- Web app builds and renders (landing page, dashboard, all pages)
- Chrome extension builds (7 content scripts + background + popup)
- JWT auth flow (register → login → access token → refresh)
- Local image upload and serving
- Extension auth bridge (auto-picks up token from web app)

### What's Partially Working
- Cross-listing flow: extension opens correct platform URLs and sends listing data to content scripts. Content scripts fill forms. But marketplace UIs change frequently — selectors may break.
- eBay/Etsy API integration: code is complete but uses placeholder credentials. Token refresh logic implemented but untested against real APIs.
- BullMQ queue: configured but requires Redis. App gracefully degrades without it.

### What's Broken / Known Bugs
| Bug | Severity | Location | Notes |
|-----|----------|----------|-------|
| No real API credentials | HIGH | `.env` | eBay/Etsy OAuth won't work until real keys are configured |
| Browser automation selectors are fragile | MEDIUM | `apps/extension/src/content/*.ts` | Marketplace UI changes break selectors |
| Images stored on local filesystem | MEDIUM | `apps/api/public/uploads/` | Won't persist across deployments |
| No HTTPS in development | LOW | All | OAuth callbacks may require HTTPS in production |

### Technical Debt
| Item | Impact | Effort to Fix |
|------|--------|---------------|
| Zero test coverage | HIGH | Significant — unit + integration + e2e needed |
| Facebook/Gumtree not using AutomationFramework | LOW | Medium — refactor risk vs. working code |
| No error monitoring (Sentry, etc.) | MEDIUM | Low — install + configure |
| `any` types in some service files | LOW | Low — add proper interfaces |
| No CI/CD pipeline | MEDIUM | Medium — GitHub Actions setup |

---

## 6. Recent Changes

### Last Session Summary
- Ran 7 specialist agent reviews in parallel (Security, Codebase Reviewer, Senior Developer, Structure, Developer Team, Documentation, SEO & Marketing)
- Applied 45+ fixes across all layers: security hardening, architecture improvements, code quality, accessibility, documentation
- Fixed Gumtree content script CORS bug (missing `dataUrl` support)
- Removed Gumtree auto-submit (now consistent "review manually" pattern across all platforms)
- Added `verifyLoggedIn` to Depop and Poshmark
- Initialized git repo and pushed to GitHub (kaylum54/ListVariant)
- Applied Prisma schema changes (5 new indices)
- Rebuilt and verified Chrome extension
- Extracted project-summarizer skill from `.skill` archive to folder format

### Recent Decisions Made
| Decision | Rationale | Date |
|----------|-----------|------|
| Keep Facebook content script standalone (not AutomationFramework) | Working code, refactoring risks breaking it | 2026-01-31 |
| Remove Gumtree auto-submit | Consistency — all platforms stop at "review manually" | 2026-01-31 |
| JWT algorithm pinning (HS256 only) | Prevents alg:none JWT bypass attacks | 2026-01-31 |
| CSRF via Origin/Referer check | Stateless CSRF protection, Bearer token requests bypass | 2026-01-31 |
| 5 new database indices | Query performance on common access patterns | 2026-01-31 |
| Graceful shutdown (Prisma+Redis+BullMQ) | Prevent data corruption on process termination | 2026-01-31 |

### Files Recently Modified
- `apps/extension/src/content/gumtree.ts` — dataUrl support, removed auto-submit
- `apps/extension/src/content/depop.ts` — added verifyLoggedIn
- `apps/extension/src/content/poshmark.ts` — added verifyLoggedIn
- `apps/api/src/middleware/security.ts` — CSRF, sanitizer, rate limiting, headers
- `apps/api/src/middleware/auth.ts` — JWT algorithm pinning
- `apps/api/src/routes/auth.routes.ts` — Zod validation on all endpoints
- `apps/api/src/services/auth.service.ts` — logout/token revocation
- `apps/api/src/index.ts` — graceful shutdown, structured logging
- `packages/database/prisma/schema.prisma` — 5 new indices

---

## 7. Configuration & Environment

### Environment Variables Required
| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost:5432/syncsellr` |
| `REDIS_URL` | Redis (optional) | `redis://localhost:6379` |
| `JWT_SECRET` | Access token signing (min 32 chars) | Generated via `crypto.randomBytes(64)` |
| `JWT_REFRESH_SECRET` | Refresh token signing (min 32 chars) | Generated via `crypto.randomBytes(64)` |
| `EBAY_CLIENT_ID` | eBay API app ID | From eBay Developer Portal |
| `EBAY_CLIENT_SECRET` | eBay API secret | From eBay Developer Portal |
| `EBAY_REDIRECT_URI` | eBay OAuth callback | `http://localhost:4000/api/connections/ebay/callback` |
| `ETSY_CLIENT_ID` | Etsy API key | From Etsy Developer Portal |
| `ETSY_CLIENT_SECRET` | Etsy API secret | From Etsy Developer Portal |
| `PORT` | API port | `4000` |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:3000` |

### Configuration Files
| File | Purpose |
|------|---------|
| `turbo.json` | Turborepo task definitions and caching |
| `apps/api/tsconfig.json` | API TypeScript config |
| `apps/web/tailwind.config.js` | TailwindCSS theme and plugins |
| `apps/extension/src/manifest.json` | Chrome extension manifest (MV3) |
| `apps/extension/build.mjs` | Custom Vite build script for IIFE content scripts |
| `docker-compose.yml` | PostgreSQL + Redis + API services |
| `.env.example` | Template for all environment variables |

### Local Setup Requirements
1. Node.js (LTS), npm
2. PostgreSQL 15 (or Docker)
3. Redis (optional, for BullMQ)
4. Chrome browser (for extension testing)

---

## 8. External Integrations

### APIs & Services
| Service | Purpose | Status |
|---------|---------|--------|
| eBay REST API | Publish/manage listings via OAuth | Scaffolded, needs real credentials |
| Etsy REST API | Publish/manage listings via OAuth + PKCE | Scaffolded, needs real credentials |
| Facebook Marketplace | Browser automation via content script | Working (selectors may drift) |
| Gumtree | Browser automation via content script | Working (selectors may drift) |
| Vinted | Browser automation via content script | Scaffolded, untested on live site |
| Depop | Browser automation via content script | Scaffolded, untested on live site |
| Poshmark | Browser automation via content script | Scaffolded, untested on live site |

### Third-Party Dependencies
- PostgreSQL — primary database
- Redis — optional job queue backend (BullMQ)
- AWS S3 — planned for cloud image storage (not yet configured)

---

## 9. Testing Status

### Test Coverage
**Zero.** No test files exist anywhere in the project.

### Test Types Present
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [x] Manual testing only

### Known Test Gaps
Everything. Priority areas:
1. Auth flow (register/login/refresh/logout)
2. Listing CRUD operations
3. Marketplace connection OAuth flows
4. Extension message passing (background ↔ content script)
5. Content script form filling (would need E2E with actual marketplace pages)

---

## 10. Documentation Status

### Existing Documentation
| Document | Location | Current? |
|----------|----------|----------|
| README | `README.md` | Yes |
| API docs | `docs/API.md` | Yes |
| Setup guide | `docs/SETUP.md` | Yes |
| Extension docs | `docs/EXTENSION.md` | Yes |
| ADR-001: Monorepo | `docs/architecture/ADR-001-monorepo.md` | Yes |
| ADR-002: PostgreSQL + Prisma | `docs/architecture/ADR-002-postgresql-prisma.md` | Yes |
| ADR-003: JWT Auth | `docs/architecture/ADR-003-jwt-auth.md` | Yes |
| ADR-004: Browser Automation | `docs/architecture/ADR-004-browser-automation.md` | Yes |
| ADR-005: Image Pre-fetch | `docs/architecture/ADR-005-image-prefetch.md` | Yes |
| .env.example | `.env.example` | Yes |

### Documentation Gaps
- No inline JSDoc/TSDoc on services
- No API endpoint examples (curl/httpie)
- No troubleshooting guide for extension selector failures

---

## 11. Security Considerations

### Authentication/Authorization
- JWT access tokens (short-lived) + refresh tokens (long-lived)
- bcryptjs password hashing
- Algorithm pinning to HS256 (prevents alg:none attacks)
- JWT secret strength validation at startup (rejects weak secrets in production)
- Refresh token revocation on logout
- Zod validation on all auth endpoints (email, password complexity, etc.)

### Known Security Items
- Rate limiting on auth endpoints (5/min general, 10/15min passwords)
- CSRF protection via Origin/Referer checking (Bearer token requests bypass)
- Input sanitization middleware (XSS defense-in-depth)
- Helmet security headers
- `.env` file gitignored, `.env.example` has no real secrets

### Sensitive Data Handling
- Passwords hashed with bcrypt (never stored in plaintext)
- OAuth tokens stored in database (encrypted at rest depends on PostgreSQL config)
- JWT secrets stored in environment variables only
- No PII exported to client beyond user email/name

---

## 12. Performance Notes

### Known Performance Issues
- Image upload stores to local filesystem (not scalable)
- No database connection pooling configured (Prisma defaults)
- Content scripts poll for elements with 200ms intervals (could be optimized with MutationObserver)

### Optimization Status
- 5 database indices added for common query patterns
- Circuit breaker prevents cascading failures from slow external APIs
- Redis caching available (optional) via `withRedis()` helper
- Platform registry uses TTL-based adapter cache (5 minutes)
- Extension images pre-fetched in background (avoids CORS + parallel fetch)

---

## 13. Deployment

### Current Deployment Status
**Not deployed.** Development only (localhost).

### Deployment Process
```bash
# Docker (recommended)
docker compose up

# Manual
npm install
npx prisma db push --schema packages/database/prisma/schema.prisma
npm run dev
cd apps/extension && node build.mjs
```

### Environments
| Environment | URL | Status |
|-------------|-----|--------|
| Development | localhost:3000 (web), localhost:4000 (API) | Working |
| Staging | — | Not set up |
| Production | — | Not set up |

---

## 14. Blockers & Open Questions

### Current Blockers
| Blocker | Impact | Waiting On |
|---------|--------|------------|
| No real eBay API credentials | Can't test eBay OAuth or listing publish | Developer Portal registration |
| No real Etsy API credentials | Can't test Etsy OAuth or listing publish | Developer Portal registration |
| No production hosting | Can't deploy | Hosting decision (Vercel? VPS? AWS?) |
| Zero test coverage | Risk of regressions | Test framework setup |

### Open Questions / Decisions Needed
| Question | Context | Options |
|----------|---------|---------|
| Hosting platform? | Need to deploy API + web + database | Vercel (web) + Railway/Fly.io (API) + Supabase (DB); or single VPS with Docker |
| Cloud image storage? | Local filesystem won't work in production | AWS S3, Cloudinary, Supabase Storage |
| How to handle selector breakage? | Marketplace UIs change frequently | Auto-detect failures + manual selector update; or AI-based selector healing |
| Subscription/payment system? | Pricing tiers shown on landing page | Stripe integration |

---

## 15. Next Steps

### Immediate Priority (Now)
1. Register for eBay Developer account and configure real API credentials
2. Register for Etsy Developer account and configure real API credentials
3. Test the full cross-listing flow end-to-end on each marketplace

### Short-term
- [ ] Set up Jest/Vitest test framework
- [ ] Write auth flow tests (register/login/refresh/logout)
- [ ] Write listing CRUD tests
- [ ] Test Vinted/Depop/Poshmark content scripts on live sites and fix selectors
- [ ] Set up CI/CD (GitHub Actions)

### Medium-term
- [ ] Configure cloud image storage (S3 or Cloudinary)
- [ ] Deploy to production (Docker + managed DB)
- [ ] Add Stripe for subscription payments
- [ ] Add error monitoring (Sentry)
- [ ] Build sale tracking and profit reporting features
- [ ] Add wholesale catalog import

---

## 16. Context for Claude

### Key Things to Know
- This is a **Turborepo monorepo**. Run commands from root with `npm run dev`, or from individual app directories.
- The Chrome extension content scripts **must** be built as IIFE (not ES modules) — see `build.mjs`.
- Image pre-fetch in the background service worker uses `arrayBuffer()` + `btoa()` — **NOT** `FileReader` (unavailable in service workers).
- Facebook and Gumtree content scripts are **standalone** (no AutomationFramework). Vinted, Depop, Poshmark use the shared `AutomationFramework` base class. Do NOT refactor Facebook to use the framework.
- The `.env` file has placeholder secrets. The API validates JWT secret strength at startup in production mode.

### Patterns to Follow
- New API-based marketplace: implement `MarketplaceAdapter` interface, register in `registry.ts`
- New browser-based marketplace: extend `AutomationFramework`, add content script, update `manifest.json`, `build.mjs`, and background `platformUrls`
- All auth endpoints must have Zod validation
- External API calls should use the circuit breaker
- Content scripts must handle `dataUrl` images from background pre-fetch

### Things to Avoid
- **Don't modify facebook.ts** — it's a working, battle-tested flow
- **Don't use `FileReader`** in service workers (use `arrayBuffer` + `btoa`)
- **Don't use Playwright/non-CSS selectors** like `:has-text()` in `querySelector` calls
- **Don't auto-submit** listings — always stop at "review and publish manually"
- **Don't over-engineer** — this is a "vibe coding" project; ship and iterate

### Relevant Past Decisions
- eBay-specific token fields were migrated to generic `accessToken`/`refreshToken`/`tokenExpiresAt` on `MarketplaceConnection` to support multiple OAuth platforms
- `OAuthState` model added for Etsy PKCE flow (temporary CSRF/code verifier storage)
- Rate limiting split into three tiers: auth (5/min), passwords (10/15min), general API (100/min)
- Gumtree auto-submit removed for consistency with all other platforms

---

## Appendix: Key File Reference

### Entry Points
| Purpose | File |
|---------|------|
| API entry | `apps/api/src/index.ts` |
| Web app entry | `apps/web/src/app/layout.tsx` |
| Landing page | `apps/web/src/app/page.tsx` |
| Extension background | `apps/extension/src/background/index.ts` |
| Extension manifest | `apps/extension/src/manifest.json` |
| Extension build | `apps/extension/build.mjs` |
| Database schema | `packages/database/prisma/schema.prisma` |

### Most Important Files
| File | Why It Matters |
|------|----------------|
| `apps/api/src/services/marketplace/types.ts` | MarketplaceAdapter interface — contract for all API platforms |
| `apps/extension/src/lib/automation/AutomationFramework.ts` | Base class for all browser automation scripts |
| `apps/api/src/middleware/security.ts` | All security middleware (rate limiting, CSRF, sanitization) |
| `apps/api/src/config/index.ts` | All platform configuration + JWT validation |
| `apps/extension/src/background/index.ts` | Message routing, image pre-fetch, cross-list flow |
| `apps/api/src/routes/connection.routes.ts` | OAuth flows for eBay and Etsy |

### Files That Need Attention
| File | Issue |
|------|-------|
| `apps/extension/src/content/vinted.ts` | Selectors untested on live Vinted |
| `apps/extension/src/content/depop.ts` | Selectors untested on live Depop |
| `apps/extension/src/content/poshmark.ts` | Selectors untested on live Poshmark |
| `apps/api/src/services/ebay.service.ts` | Needs real API testing |
| `apps/api/src/services/marketplace/etsy.service.ts` | Needs real API testing |

---

## Summary Confidence

| Confidence | Sections |
|------------|----------|
| **High** — Verified, certain | 1, 2, 3, 4, 6, 7, 8, 9, 10, 13, 16 |
| **Medium** — Likely accurate, not verified | 5, 11, 12 |
| **Low** — Uncertain, needs verification | 14 (open questions depend on user priorities) |

---

*Generated by Project Summarizer agent for context continuity.*
