# ADR-001: Turborepo Monorepo Structure

## Status
Accepted

## Context
SyncSellr consists of multiple applications (API, web frontend, Chrome extension) and shared packages (database). We needed a way to manage these together with shared dependencies and build orchestration.

## Decision
Use Turborepo as the monorepo tool with the following structure:
- `apps/api` — Express.js backend (port 4000)
- `apps/web` — Next.js frontend (port 3000)
- `apps/extension` — Chrome Extension (MV3)
- `packages/database` — Prisma client shared package (`@syncsellr/database`)
- `packages/shared` — Shared types and utilities (`@syncsellr/shared`)
- `packages/ui` — Shared UI components (`@syncsellr/ui`)

## Consequences
- Shared `@syncsellr/database` package used by API for type-safe DB queries
- Shared `@syncsellr/shared` package for cross-app types and utilities
- Shared `@syncsellr/ui` package for reusable React components (Button, Input, Select, Textarea)
- Single `package-lock.json` at root via npm workspaces
- Turborepo handles build caching and task orchestration
- Extension has its own build pipeline (`build.mjs`) since content scripts require IIFE format
