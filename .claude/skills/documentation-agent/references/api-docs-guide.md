# API Documentation Guide

Best practices for documenting APIs consistently and completely.

## Documentation Structure

### Organize by Resource

```
/docs/api/
├── overview.md           # Introduction, auth, conventions
├── errors.md             # Error codes and handling
└── endpoints/
    ├── auth.md           # Authentication endpoints
    ├── users.md          # User resource endpoints
    └── [resource].md     # Other resources
```

### Resource File Structure

Each resource file should cover:

1. **Resource overview** — What is this resource?
2. **Data model** — What fields does it have?
3. **Endpoints** — CRUD operations and any special endpoints
4. **Examples** — Real request/response examples

## Writing Effective API Docs

### Be Specific About Types

```markdown
❌ Bad
| Field | Type | Description |
|-------|------|-------------|
| id | string | The ID |
| status | string | Status |

✅ Good
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier, 36 characters |
| status | string (enum) | One of: `pending`, `active`, `cancelled` |
```

### Include All Error Cases

Don't just document the happy path:

```markdown
## Error Responses

### 400 Bad Request

Returned when request validation fails.

| Code | Message | Cause |
|------|---------|-------|
| `INVALID_EMAIL` | Email format is invalid | `email` field doesn't match email pattern |
| `MISSING_FIELD` | Required field missing | A required field was not provided |

### 401 Unauthorized

Returned when authentication fails.

| Code | Message | Cause |
|------|---------|-------|
| `TOKEN_EXPIRED` | Access token has expired | Token TTL exceeded |
| `TOKEN_INVALID` | Token is malformed | Token doesn't match expected format |

### 403 Forbidden

Returned when user lacks permission.

| Code | Message | Cause |
|------|---------|-------|
| `INSUFFICIENT_PERMISSIONS` | User cannot perform this action | Role doesn't include required permission |

### 404 Not Found

Returned when resource doesn't exist.

### 409 Conflict

Returned when action conflicts with current state.

| Code | Message | Cause |
|------|---------|-------|
| `EMAIL_EXISTS` | Email already registered | Attempted to create user with existing email |

### 429 Too Many Requests

Returned when rate limit exceeded.

| Header | Value |
|--------|-------|
| `Retry-After` | Seconds until limit resets |
| `X-RateLimit-Remaining` | Requests remaining |
```

### Show Real Examples

Use realistic data in examples:

```markdown
❌ Bad (meaningless)
\`\`\`json
{
  "field1": "value1",
  "field2": "value2"
}
\`\`\`

✅ Good (realistic)
\`\`\`json
{
  "id": "usr_8a7b6c5d4e3f2a1b",
  "email": "jane.doe@example.com",
  "name": "Jane Doe",
  "role": "admin",
  "created_at": "2025-01-15T09:30:00Z"
}
\`\`\`
```

### Document Authentication Clearly

```markdown
## Authentication

All API requests require authentication via Bearer token.

### Getting a Token

\`\`\`bash
POST /api/v1/auth/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
\`\`\`

Response:
\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
\`\`\`

### Using the Token

Include in the `Authorization` header:

\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
\`\`\`

### Token Expiration

Tokens expire after 1 hour. Use the refresh endpoint to obtain a new token:

\`\`\`bash
POST /api/v1/auth/refresh
\`\`\`
```

### Document Pagination

```markdown
## Pagination

List endpoints support pagination via query parameters.

### Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Page number (1-indexed) |
| `per_page` | integer | 20 | 100 | Items per page |

### Response Format

\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_items": 98
  }
}
\`\`\`

### Example

\`\`\`bash
GET /api/v1/users?page=2&per_page=50
\`\`\`
```

### Document Rate Limits

```markdown
## Rate Limits

API requests are rate limited per API key.

| Tier | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Free | 60 | 1,000 |
| Pro | 600 | 50,000 |
| Enterprise | Custom | Custom |

### Rate Limit Headers

Every response includes:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Max requests in window |
| `X-RateLimit-Remaining` | Requests remaining |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

### Handling 429 Responses

When rate limited, wait for the `Retry-After` header value before retrying.
```

## Common Patterns

### Versioning

Document the versioning strategy:

```markdown
## API Versioning

The API version is included in the URL path:

\`\`\`
https://api.example.com/v1/users
\`\`\`

### Version Lifecycle

| Version | Status | Sunset Date |
|---------|--------|-------------|
| v1 | Current | - |
| v0 | Deprecated | 2025-06-01 |

### Breaking Changes

Breaking changes are only introduced in new major versions. 
Non-breaking additions may occur in minor updates.
```

### Filtering & Sorting

```markdown
## Filtering

List endpoints support filtering via query parameters.

### Filter Syntax

\`\`\`bash
GET /api/v1/users?status=active&role=admin
\`\`\`

### Available Filters

| Resource | Filterable Fields |
|----------|-------------------|
| Users | `status`, `role`, `created_after`, `created_before` |
| Orders | `status`, `customer_id`, `min_total`, `max_total` |

## Sorting

### Sort Syntax

\`\`\`bash
GET /api/v1/users?sort=created_at&order=desc
\`\`\`

### Parameters

| Parameter | Values | Default |
|-----------|--------|---------|
| `sort` | Any sortable field | `created_at` |
| `order` | `asc`, `desc` | `desc` |
```

### Webhooks

```markdown
## Webhooks

Receive real-time notifications when events occur.

### Configuring Webhooks

\`\`\`bash
POST /api/v1/webhooks
{
  "url": "https://your-server.com/webhook",
  "events": ["user.created", "order.completed"],
  "secret": "your-webhook-secret"
}
\`\`\`

### Event Payload

\`\`\`json
{
  "id": "evt_123abc",
  "type": "user.created",
  "created_at": "2025-01-31T12:00:00Z",
  "data": {
    "user": { ... }
  }
}
\`\`\`

### Verifying Signatures

Webhooks include a signature header for verification:

\`\`\`
X-Webhook-Signature: sha256=abc123...
\`\`\`

Verify using HMAC-SHA256 with your webhook secret.

### Retry Policy

Failed webhook deliveries are retried:
- 3 attempts
- Exponential backoff (1min, 5min, 30min)
- After 3 failures, webhook is disabled
```

## Documentation Checklist

Before publishing API documentation, verify:

- [ ] All endpoints documented
- [ ] Request/response examples for each endpoint
- [ ] All error codes documented
- [ ] Authentication explained with examples
- [ ] Rate limits documented
- [ ] Pagination explained
- [ ] Data types are specific (not just "string")
- [ ] Required vs optional fields marked
- [ ] Examples use realistic data
- [ ] cURL examples provided
- [ ] SDK examples if SDKs exist

## Keeping Docs Updated

### When Code Changes

1. **New endpoint** → Add documentation before merging
2. **Changed endpoint** → Update docs in same PR
3. **Deprecated endpoint** → Mark as deprecated, add sunset date
4. **Removed endpoint** → Remove docs, note in changelog

### Review Process

API documentation changes should be reviewed by:
- Developer who made the change (accuracy)
- Documentation Agent (consistency, completeness)
- Another developer (clarity, usability)
