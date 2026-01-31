# ADR-003: JWT Authentication

## Status
Accepted

## Context
Need stateless authentication for the API that also works with the Chrome extension.

## Decision
Use JWT tokens with access + refresh token pattern.

## Consequences
- Access tokens are short-lived, refresh tokens are long-lived
- `authenticate` middleware extracts `userId` from JWT on every request
- Extension stores token via `chrome.storage.local`
- Auth bridge content script passes tokens between web app and extension
- Rate limiting on auth endpoints (5 attempts/minute) prevents brute force
