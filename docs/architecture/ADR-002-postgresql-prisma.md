# ADR-002: PostgreSQL via Prisma ORM

## Status
Accepted

## Context
Need a relational database for users, listings, marketplace connections, and sales tracking. Required: strong typing, migrations, and a good developer experience.

## Decision
Use PostgreSQL 15 with Prisma ORM.

## Consequences
- Type-safe database queries via generated Prisma Client
- Schema changes managed via `prisma db push` (development) or `prisma migrate` (production)
- `@tom-flips/database` package exports the Prisma client for use across apps
- Generic OAuth token fields on `MarketplaceConnection` support multiple platforms (eBay, Etsy)
- `OAuthState` model enables PKCE flows for secure OAuth

## Data Model

| Model | Purpose |
|-------|---------|
| `User` | User accounts with email/password auth and subscription tier |
| `Listing` | Product listings with title, price, condition, dimensions, SKU |
| `ListingImage` | Images attached to listings (position-ordered) |
| `MarketplaceConnection` | Per-user marketplace account links with OAuth tokens |
| `MarketplaceListing` | Tracks where each listing is published (external IDs, status) |
| `OAuthState` | Temporary CSRF/PKCE state for OAuth flows (auto-expires) |
| `WholesaleItem` | Wholesale catalog items that can be imported as listings |
| `Sale` | Completed sales with price, fees, and profit tracking |
