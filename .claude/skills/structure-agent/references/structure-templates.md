# Structure Templates by Project Type

Detailed folder structures for common project types.

## Next.js Application (App Router)

```
/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Route group: auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/            # Route group: protected pages
│   │   │   ├── layout.tsx          # Dashboard layout with nav
│   │   │   ├── page.tsx            # Dashboard home
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/                    # API routes
│   │   │   └── [route]/
│   │   │       └── route.ts
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page
│   │   └── globals.css
│   │
│   ├── features/                   # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── actions/            # Server actions
│   │   │   │   └── auth.actions.ts
│   │   │   └── index.ts            # Public exports
│   │   │
│   │   └── billing/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── index.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/                 # Base UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── index.ts
│   │   │   └── layout/             # Layout components
│   │   │       ├── Header.tsx
│   │   │       └── Footer.tsx
│   │   ├── hooks/
│   │   │   └── useMediaQuery.ts
│   │   ├── utils/
│   │   │   ├── cn.ts               # Classname utility
│   │   │   └── formatters.ts
│   │   ├── types/
│   │   │   └── common.types.ts
│   │   └── lib/                    # Third-party integrations
│   │       └── db.ts
│   │
│   └── config/
│       └── site.ts                 # Site configuration
│
├── public/
│   ├── images/
│   └── fonts/
│
├── tests/
│   └── e2e/
│
├── docs/
│   └── architecture/
│       ├── file-structure.md
│       └── conventions.md
│
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## React SPA (Vite)

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Root component
│   │   ├── Router.tsx              # Route definitions
│   │   └── providers/              # Context providers
│   │       ├── AuthProvider.tsx
│   │       └── index.tsx
│   │
│   ├── pages/                      # Page components
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   └── Settings.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   │   └── auth.api.ts
│   │   │   └── index.ts
│   │   └── [feature]/
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── api/                        # API client
│   │   ├── client.ts               # Axios/fetch wrapper
│   │   └── endpoints.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── main.tsx                    # Entry point
│
├── public/
├── tests/
├── docs/
└── [config files]
```

## Node.js API (Express/Fastify)

```
/
├── src/
│   ├── app/
│   │   ├── server.ts               # Server setup
│   │   └── app.ts                  # Express/Fastify app
│   │
│   ├── routes/                     # Route handlers (thin)
│   │   ├── index.ts                # Route registration
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   └── [resource].routes.ts
│   │
│   ├── controllers/                # Request handling logic
│   │   ├── auth.controller.ts
│   │   └── users.controller.ts
│   │
│   ├── services/                   # Business logic
│   │   ├── auth.service.ts
│   │   └── users.service.ts
│   │
│   ├── repositories/               # Data access
│   │   ├── base.repository.ts
│   │   └── users.repository.ts
│   │
│   ├── models/                     # Data models
│   │   ├── user.model.ts
│   │   └── index.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── shared/
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── validators.ts
│   │   ├── types/
│   │   │   └── express.d.ts        # Type extensions
│   │   └── errors/
│   │       ├── AppError.ts
│   │       └── index.ts
│   │
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── index.ts
│   │
│   └── index.ts                    # Entry point
│
├── prisma/                         # If using Prisma
│   ├── schema.prisma
│   └── migrations/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── docs/
│   └── api/                        # API documentation
│
└── [config files]
```

## Monorepo (Turborepo/Nx)

```
/
├── apps/
│   ├── web/                        # Next.js frontend
│   │   ├── src/
│   │   ├── package.json
│   │   └── [config files]
│   │
│   ├── api/                        # Backend API
│   │   ├── src/
│   │   ├── package.json
│   │   └── [config files]
│   │
│   └── admin/                      # Admin dashboard
│       └── ...
│
├── packages/
│   ├── ui/                         # Shared UI components
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── config/                     # Shared config
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── package.json
│   │
│   ├── database/                   # Shared database client/models
│   │   ├── src/
│   │   └── package.json
│   │
│   └── utils/                      # Shared utilities
│       ├── src/
│       └── package.json
│
├── docs/
├── turbo.json                      # Turborepo config
├── package.json                    # Root package.json
└── pnpm-workspace.yaml             # Workspace config
```

## Python FastAPI

```
/
├── src/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app
│   │   └── dependencies.py         # Dependency injection
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── users.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   └── user_service.py
│   │
│   ├── repositories/
│   │   ├── __init__.py
│   │   └── user_repository.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                 # SQLAlchemy models
│   │   └── base.py
│   │
│   ├── schemas/                    # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── auth.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py               # Settings
│   │   ├── security.py             # Auth utilities
│   │   └── database.py             # DB connection
│   │
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_users.py
│
├── alembic/                        # Migrations
│   └── versions/
│
├── docs/
├── requirements.txt
├── pyproject.toml
└── Dockerfile
```

## Choosing a Structure

| Project Type | Recommended Structure |
|--------------|----------------------|
| Marketing site | Next.js App Router |
| SaaS application | Next.js App Router or React SPA + API |
| API only | Node.js API or Python FastAPI |
| Multiple apps sharing code | Monorepo |
| Mobile + Web | Monorepo with shared packages |

## Scaling Considerations

### When to Split Features

Split a feature into sub-features when:
- It has 10+ components
- Multiple developers work on it simultaneously
- It has distinct sub-domains

### When to Extract Shared Code

Move to `/shared/` only when:
- Code is used by 3+ features
- It's truly generic (no feature-specific logic)
- The interface is stable

### When to Consider Monorepo

Consider monorepo when:
- Multiple deployable apps share code
- Team is large enough to benefit from isolation
- Different release cycles for different apps
