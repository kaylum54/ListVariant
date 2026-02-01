# SyncSellr API Reference

Base URL: `http://localhost:4000/api`

All authenticated endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are HS256 JWTs with a 15-minute lifetime. Use the refresh endpoint to obtain new tokens.

---

## Rate Limits

| Scope | Window | Max Requests |
|-------|--------|-------------|
| Auth endpoints (`/api/auth/*`) | 1 minute | 5 |
| All API endpoints (`/api/*`) | 1 minute | 100 |

Rate limit headers (`RateLimit-*`) are included in responses.

---

## Health Check

### `GET /health`

No authentication required.

**Response 200:**

```json
{
  "status": "ok",
  "timestamp": "2025-01-31T12:00:00.000Z",
  "uptime": 3600,
  "database": "ok",
  "memory": {
    "heapUsedMB": 45,
    "heapTotalMB": 80,
    "rssMB": 110
  }
}
```

`status` is `"ok"` when the database is reachable, `"degraded"` otherwise.

---

## Authentication

### `POST /api/auth/register`

Create a new user account.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Tom"
}
```

**Response 201:**

```json
{
  "user": { "id": "clx...", "email": "user@example.com", "name": "Tom" },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

---

### `POST /api/auth/login`

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response 200:**

```json
{
  "user": { "id": "clx...", "email": "user@example.com", "name": "Tom" },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

---

### `POST /api/auth/refresh`

Exchange a refresh token for a new access/refresh token pair.

**Request body:**

```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response 200:**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

---

### `GET /api/auth/me`

*Authenticated.* Returns the current user.

**Response 200:**

```json
{
  "id": "clx...",
  "email": "user@example.com",
  "name": "Tom",
  "subscriptionTier": "free"
}
```

---

### `POST /api/auth/logout`

Returns a static success response. The client is responsible for discarding tokens.

**Response 200:**

```json
{ "success": true }
```

---

## Listings

All listing endpoints require authentication.

### `GET /api/listings`

List all listings for the current user.

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | all | Filter by status: `draft`, `active`, `sold`, `archived` |
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 20 | Items per page (max 100) |

**Response 200:**

```json
{
  "listings": [
    {
      "id": "clx...",
      "title": "Oak Dining Table",
      "description": "Solid oak, seats 6",
      "price": "149.99",
      "condition": "used_good",
      "brand": "IKEA",
      "material": "Oak",
      "color": "Natural",
      "dimensionsLengthCm": 180,
      "dimensionsWidthCm": 90,
      "dimensionsHeightCm": 75,
      "sku": "TF-1706700000-ABC123DEF",
      "costPrice": "50.00",
      "status": "draft",
      "images": [
        { "id": "clx...", "url": "/uploads/abc.png", "position": 0 }
      ],
      "marketplaceListings": []
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### `POST /api/listings`

Create a new listing. Uses `multipart/form-data` to support image uploads.

**Request (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | 5-255 characters |
| `price` | number | Yes | Must be positive |
| `condition` | string | Yes | `new`, `used_like_new`, `used_good`, `used_fair` |
| `description` | string | No | Free text |
| `brand` | string | No | |
| `material` | string | No | |
| `color` | string | No | |
| `dimensionsLengthCm` | number | No | Positive integer |
| `dimensionsWidthCm` | number | No | Positive integer |
| `dimensionsHeightCm` | number | No | Positive integer |
| `sku` | string | No | Auto-generated if omitted |
| `costPrice` | number | No | Your purchase price |
| `notes` | string | No | Internal notes |
| `images` | file[] | No | Up to 10 images |

**Response 201:**

```json
{
  "id": "clx...",
  "title": "Oak Dining Table",
  "price": "149.99",
  "condition": "used_good",
  "sku": "TF-1706700000-ABC123DEF",
  "status": "draft",
  "images": [
    { "id": "clx...", "url": "/uploads/abc.png", "position": 0 }
  ]
}
```

---

### `GET /api/listings/:id`

Get a single listing by ID.

**Response 200:** Full listing object with `images` and `marketplaceListings` arrays.

**Response 404:**

```json
{ "error": "Listing not found" }
```

---

### `PUT /api/listings/:id`

Update a listing. All fields are optional (partial update).

**Request body (JSON):**

```json
{
  "title": "Updated Title",
  "price": 199.99
}
```

**Response 200:** Updated listing object.

---

### `DELETE /api/listings/:id`

Delete a listing. Fails if the listing has active marketplace listings.

**Response 200:**

```json
{ "success": true }
```

**Response 409:**

```json
{ "error": "Cannot delete listing with active marketplace listings. Please remove them first." }
```

---

## Connections (Marketplace Accounts)

All connection endpoints require authentication.

### `GET /api/connections`

List all marketplace connections for the current user.

**Response 200:**

```json
[
  {
    "id": "clx...",
    "marketplace": "ebay",
    "status": "connected",
    "lastSyncAt": null
  },
  {
    "id": "clx...",
    "marketplace": "facebook",
    "status": "connected",
    "lastSyncAt": null
  }
]
```

---

### `POST /api/connections/:marketplace/connect`

Mark a marketplace as connected. Used by browser-based marketplaces (Facebook, Gumtree, Vinted, Depop, Poshmark) after the user confirms they have logged in.

**Valid marketplace values:** `ebay`, `facebook`, `gumtree`, `etsy`, `vinted`, `depop`, `poshmark`

**Response 200:**

```json
{
  "id": "clx...",
  "marketplace": "facebook",
  "status": "connected"
}
```

---

### `POST /api/connections/:marketplace/disconnect`

Remove a marketplace connection.

**Response 200:**

```json
{ "success": true }
```

---

### `GET /api/connections/ebay/auth-url`

Get the eBay OAuth authorization URL. Redirect the user to this URL to start the eBay connection flow.

**Response 200:**

```json
{ "url": "https://auth.ebay.com/oauth2/authorize?..." }
```

---

### `GET /api/connections/ebay/callback`

Handle the eBay OAuth callback. Called after eBay redirects back with an authorization code.

**Query parameters:** `code`, `state`

**Response 200:**

```json
{ "success": true }
```

---

### `GET /api/connections/etsy/auth-url`

Get the Etsy OAuth authorization URL.

**Response 200:**

```json
{ "url": "https://www.etsy.com/oauth/connect?..." }
```

---

### `GET /api/connections/etsy/callback`

Handle the Etsy OAuth callback.

**Query parameters:** `code`, `state`

**Response 200:**

```json
{ "success": true }
```

---

## Static Files

Uploaded images are served at:

```
GET /uploads/<filename>
```

For example: `http://localhost:4000/uploads/857a6e37-860c-4b7c-8eec-3e134194cd60.png`

---

## Marketplace Platforms Summary

| Platform | Integration Type | How It Works |
|----------|-----------------|--------------|
| eBay | API (OAuth) | Server-side via eBay Sell Inventory API |
| Etsy | API (OAuth + PKCE) | Server-side via Etsy Open API |
| Facebook Marketplace | Browser automation | Chrome extension content script fills the listing form |
| Gumtree | Browser automation | Chrome extension content script fills the listing form |
| Vinted | Browser automation | Chrome extension content script fills the listing form |
| Depop | Browser automation | Chrome extension content script fills the listing form |
| Poshmark | Browser automation | Chrome extension content script fills the listing form |

---

## Error Responses

All errors follow this shape:

```json
{ "error": "Human-readable error message" }
```

Common HTTP status codes:

| Code | Meaning |
|------|---------|
| 400 | Bad request / validation error |
| 401 | Authentication required or token expired |
| 404 | Resource not found |
| 409 | Conflict (e.g., deleting listing with active marketplace entries) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
