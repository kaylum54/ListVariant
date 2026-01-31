# Summary Examples

Real-world examples of project summaries at different stages.

## Example 1: Early Stage Web App

```markdown
# Project Summary: InvoiceFlow

**Generated:** January 31, 2025, 3:45 PM
**Summary Type:** Checkpoint

---

## 1. Project Overview

### What This Project Is
InvoiceFlow is a SaaS application for freelancers to create, send, and track invoices. The core value proposition is simplicity — get an invoice out in under 60 seconds.

### Target Users
Freelancers and independent contractors who need basic invoicing without the complexity of full accounting software.

### Current Status
**Early Development** — Core infrastructure set up, authentication working, starting on invoice creation.

---

## 2. Tech Stack

### Core Technologies
| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Next.js 14 (App Router) | Using Server Components |
| Backend | Next.js API Routes | Serverless functions |
| Database | PostgreSQL (Supabase) | Hosted, with Row Level Security |
| Hosting | Vercel | Preview deploys enabled |

### Key Dependencies
- next: 14.1.0
- @supabase/supabase-js: 2.39.0
- tailwindcss: 3.4.1
- react-hook-form: 7.49.0
- zod: 3.22.4

### Development Tools
- TypeScript (strict mode)
- ESLint + Prettier
- Jest for testing (not yet configured)

---

## 3. Architecture Overview

### High-Level Structure
Monolithic Next.js app with Supabase backend. Server Components for most pages, Client Components for interactive forms.

### Key Patterns
- Server Actions for mutations
- Zod schemas for validation (shared client/server)
- Repository pattern for database access
- Feature-based folder structure

### File Structure
```
src/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (dashboard)/      # Protected pages
│   │   ├── invoices/
│   │   └── settings/
│   └── api/
├── features/
│   ├── auth/
│   ├── invoices/
│   └── clients/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── lib/
    └── supabase/
```

---

## 4. Features

### Completed Features
| Feature | Description | Location |
|---------|-------------|----------|
| Auth - Signup | Email/password registration | `/features/auth/` |
| Auth - Login | Email/password login | `/features/auth/` |
| Auth - Logout | Session termination | `/features/auth/` |
| Dashboard Layout | Sidebar nav, header | `/app/(dashboard)/layout.tsx` |

### In Progress
| Feature | Status | Blockers | Location |
|---------|--------|----------|----------|
| Invoice Creation | 40% - Form UI built | Need line items component | `/features/invoices/` |
| Client Management | 20% - Schema defined | Waiting on invoice to finish | `/features/clients/` |

### Planned / Not Started
| Feature | Priority | Dependencies |
|---------|----------|--------------|
| Invoice PDF Generation | High | Invoice creation |
| Email Sending | High | PDF generation |
| Payment Integration (Stripe) | Medium | Invoice creation |
| Dashboard Analytics | Low | Invoices + Payments |

---

## 5. Current State of Code

### What's Working
- User can sign up, log in, log out
- Protected routes redirect to login
- Dashboard layout renders correctly
- Database connection and queries working

### What's Partially Working
- Invoice form renders but doesn't submit yet
- Client selector exists but no clients to select

### What's Broken / Known Bugs
| Bug | Severity | Location | Notes |
|-----|----------|----------|-------|
| Flash of unauthenticated content | Low | Dashboard | Need loading state |
| Form doesn't preserve state on error | Medium | Invoice form | Add react-hook-form properly |

### Technical Debt
| Item | Impact | Effort to Fix |
|------|--------|---------------|
| No error boundaries | Medium | Low |
| Console.logs in production code | Low | Low |
| Missing loading states | Medium | Medium |

---

## 6. Recent Changes

### Last Session Summary
- Set up Supabase project and configured client
- Created auth flow (signup, login, logout)
- Built dashboard layout with sidebar navigation
- Started invoice creation form

### Recent Decisions Made
| Decision | Rationale | Date |
|----------|-----------|------|
| Supabase over custom backend | Faster to ship, built-in auth | Jan 30 |
| Server Components default | Better performance, simpler mental model | Jan 30 |
| Feature-based folders | Better colocation than type-based | Jan 30 |

### Files Recently Modified
- `src/features/invoices/components/InvoiceForm.tsx` — new
- `src/lib/supabase/client.ts` — configured
- `src/app/(dashboard)/layout.tsx` — added sidebar

---

## 7. Configuration & Environment

### Environment Variables Required
| Variable | Purpose | Example |
|----------|---------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | https://xxx.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public API key | eyJhbG... |
| SUPABASE_SERVICE_ROLE_KEY | Server-side admin key | eyJhbG... |

### Configuration Files
- `next.config.js` — Next.js config (minimal)
- `tailwind.config.js` — Tailwind with custom colors
- `tsconfig.json` — Strict TypeScript

---

## 8. External Integrations

### APIs & Services
| Service | Purpose | Status |
|---------|---------|--------|
| Supabase | Auth + Database | ✅ Connected |
| Vercel | Hosting | ✅ Deployed |
| Stripe | Payments | ❌ Not started |
| Resend | Email | ❌ Not started |

---

## 9. Testing Status

### Test Coverage
No tests written yet.

### Test Types Present
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [x] Manual testing only

### Known Test Gaps
Everything — testing not yet set up.

---

## 10. Blockers & Open Questions

### Current Blockers
| Blocker | Impact | Waiting On |
|---------|--------|------------|
| None currently | | |

### Open Questions / Decisions Needed
| Question | Context | Options |
|----------|---------|---------|
| PDF generation approach | Need to generate invoice PDFs | react-pdf, puppeteer, or API service |
| Multi-currency support? | Affects data model | Yes (now) or No (later) |

---

## 11. Next Steps

### Immediate Priority (Now)
1. Finish InvoiceForm with line items
2. Create invoice submission Server Action
3. Display invoices list on dashboard

### Short-term (This Week)
- [ ] Client management CRUD
- [ ] Link clients to invoices
- [ ] Invoice detail view
- [ ] PDF generation

---

## 12. Context for Claude

### Key Things to Know
- This is a deliberately simple MVP — resist feature creep
- Using App Router patterns (Server Components, Server Actions)
- Supabase handles auth — don't build custom auth

### Patterns to Follow
- Server Components by default, 'use client' only when needed
- Zod schemas in `/features/[feature]/schemas/`
- Server Actions in `/features/[feature]/actions/`

### Things to Avoid
- Don't add complex state management (no Redux/Zustand unless truly needed)
- Don't over-engineer — MVP first
- Don't add features not in the planned list without discussion

---

## Appendix: Key File Reference

### Entry Points
| Purpose | File |
|---------|------|
| App entry | `src/app/layout.tsx` |
| Auth layout | `src/app/(auth)/layout.tsx` |
| Dashboard layout | `src/app/(dashboard)/layout.tsx` |

### Most Important Files
- `src/lib/supabase/client.ts` — Supabase client setup
- `src/features/auth/actions/auth.actions.ts` — Auth server actions
- `src/features/invoices/components/InvoiceForm.tsx` — Main form (WIP)
```

---

## Example 2: API Project Mid-Development

```markdown
# Project Summary: DataSync API

**Generated:** January 31, 2025, 5:00 PM
**Summary Type:** Handoff

---

## 1. Project Overview

### What This Project Is
DataSync API is a REST API that synchronizes data between multiple third-party services (Salesforce, HubSpot, Airtable). It provides a unified interface for CRUD operations and handles the complexity of keeping data consistent across platforms.

### Target Users
Internal development teams who need to integrate customer data across our tool stack.

### Current Status
**Active Development** — Core sync engine working, Salesforce integration complete, HubSpot in progress.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20 |
| Framework | Fastify |
| Database | PostgreSQL 15 |
| Queue | BullMQ (Redis) |
| ORM | Prisma |

---

## 3. Features

### Completed
| Feature | Endpoint |
|---------|----------|
| Salesforce Contacts Sync | `POST /sync/salesforce/contacts` |
| Salesforce Companies Sync | `POST /sync/salesforce/companies` |
| Webhook receiver | `POST /webhooks/:provider` |
| Sync status tracking | `GET /sync/:jobId/status` |
| Health check | `GET /health` |

### In Progress
| Feature | Status |
|---------|--------|
| HubSpot Contacts | 70% — auth done, mapping in progress |
| HubSpot Companies | 30% — schema defined |

### Planned
- Airtable integration
- Bi-directional sync
- Conflict resolution UI

---

## 4. API Endpoints

```
GET    /health                    # Health check
POST   /sync/salesforce/contacts  # Sync SF contacts
POST   /sync/salesforce/companies # Sync SF companies
POST   /sync/hubspot/contacts     # WIP
GET    /sync/:jobId/status        # Job status
POST   /webhooks/:provider        # Incoming webhooks
```

---

## 5. Current Issues

| Issue | Severity |
|-------|----------|
| Rate limiting not implemented | High |
| No retry logic on 429s from Salesforce | Medium |
| Webhook signature validation missing | High |

---

## 6. Next Steps

1. **Implement rate limiting** — Use bottleneck library
2. **Add retry logic** — Exponential backoff on rate limits
3. **Finish HubSpot contacts** — Complete field mapping
4. **Add webhook validation** — Verify signatures

---

## 7. Context for Claude

- All integrations follow the same pattern: see `/src/integrations/salesforce/` as reference
- Sync jobs are queued via BullMQ, processed by workers in `/src/workers/`
- Field mappings are in `/src/mappings/` — one file per integration
```

---

## Example 3: Diff Summary (What Changed)

```markdown
# Diff Summary: InvoiceFlow

**Period:** January 30-31, 2025
**Previous Summary:** January 30, 2025

---

## What Changed

### New Features
- ✅ Invoice line items component added
- ✅ Invoice submission working
- ✅ Invoices list page showing data

### Modified
- Invoice form now handles line items
- Dashboard shows invoice count
- Added invoice status enum (draft, sent, paid)

### Fixed
- Flash of unauthenticated content (added loading state)
- Form now preserves state on validation error

---

## Files Changed

### New Files
- `src/features/invoices/components/LineItems.tsx`
- `src/features/invoices/actions/invoice.actions.ts`
- `src/app/(dashboard)/invoices/page.tsx`

### Modified Files
- `src/features/invoices/components/InvoiceForm.tsx`
- `prisma/schema.prisma` (added Invoice, LineItem models)
- `src/app/(dashboard)/page.tsx`

---

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Store line items as JSON initially | Simpler than separate table, can migrate later |
| Invoice numbers auto-generated | INV-YYYYMMDD-XXX format |

---

## New Blockers
- None

## Resolved Blockers
- ~~Line items component~~ — completed

---

## Updated Next Steps
1. ~~Finish invoice form~~ ✅
2. Client management CRUD ← Now priority
3. PDF generation
4. Email sending
```

---

## Tips for Good Summaries

1. **Be specific** — "Auth working" → "Email/password login with Supabase"
2. **Include file paths** — Makes it easy to navigate
3. **Status everything** — Done, in progress, blocked, planned
4. **Capture decisions** — Future you will thank you
5. **Note blockers explicitly** — Don't bury them
6. **Keep next steps actionable** — Not "work on invoices" but "create InvoiceForm component"
