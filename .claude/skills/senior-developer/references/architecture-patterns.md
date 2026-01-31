# Architecture Patterns

Common architectural patterns and when to use them.

## Application Architecture

### Monolith (Default Choice)

Start here unless you have a specific reason not to.

**When to use:**
- New projects
- Small-medium team (1-10 devs)
- Unclear domain boundaries
- Need to ship fast

**Structure:**
```
/src
  /features
    /auth
    /users
    /billing
  /shared
    /components
    /utils
    /db
  /api
```

**Pros:** Simple deployment, easy debugging, fast iteration
**Cons:** Scaling limits, deployment coupling

### Modular Monolith

Monolith with strict module boundaries. Good stepping stone.

**When to use:**
- Growing codebase
- Want microservice benefits without operational complexity
- Preparing for potential future split

**Structure:**
```
/src
  /modules
    /auth (self-contained)
    /users (self-contained)
    /billing (self-contained)
  /shared (minimal, carefully controlled)
```

**Rules:**
- Modules only communicate via defined interfaces
- No direct database access across modules
- Shared code is minimal and stable

### Microservices

Only when you actually need them.

**When to use:**
- Different scaling requirements per service
- Different tech stacks required
- Large team needing independent deployment
- Clear, stable domain boundaries

**When NOT to use:**
- "Because Netflix does it"
- Team < 10 people
- Unclear domain boundaries
- Just starting out

## Frontend Architecture

### Component-Based (React, Vue, etc.)

**Structure:**
```
/src
  /components
    /ui (buttons, inputs, cards)
    /features (auth forms, user profiles)
    /layouts (page layouts, navigation)
  /hooks
  /utils
  /api
```

**Principles:**
- Components should be single-purpose
- Lift state only as high as needed
- Co-locate related files

### Feature-Based Organization

Group by feature, not by type.

**Structure:**
```
/src
  /features
    /auth
      components/
      hooks/
      api/
      utils/
    /dashboard
      components/
      hooks/
      api/
```

**When to use:** Larger applications where features are independent

## API Patterns

### REST (Default)

Use for most CRUD operations.

**Conventions:**
- `GET /resources` — List
- `GET /resources/:id` — Get one
- `POST /resources` — Create
- `PUT /resources/:id` — Full update
- `PATCH /resources/:id` — Partial update
- `DELETE /resources/:id` — Delete

### GraphQL

**When to use:**
- Multiple clients with different data needs
- Complex, nested data relationships
- Need to reduce over-fetching

**When NOT to use:**
- Simple CRUD
- File uploads (use REST alongside)
- Real-time requirements (consider WebSockets)

## Data Patterns

### Repository Pattern

Abstract database access behind an interface.

```
/src
  /repositories
    userRepository.ts
    orderRepository.ts
  /services
    userService.ts (uses userRepository)
```

**Benefits:** Testable, swappable data sources

### Service Layer

Business logic lives in services, not in routes or components.

```
Route → Service → Repository → Database
```

**Rules:**
- Routes handle HTTP concerns only
- Services contain business logic
- Repositories handle data access only

## State Management

### Local State First

Start with component state. Only lift when needed.

**Progression:**
1. Component state (`useState`)
2. Lifted state (parent component)
3. Context (for truly global state)
4. State library (only if Context gets painful)

### When to Use State Libraries

Consider Redux, Zustand, etc. when:
- Complex state updates
- State needed in many unrelated components
- Need time-travel debugging
- Team is already familiar

## Error Handling

### Consistent Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": { "field": "email", "issue": "invalid format" }
  }
}
```

### Error Boundaries

Catch and handle errors at appropriate levels:
- Component level: UI errors
- Route level: Page-level failures
- App level: Catastrophic failures

## Performance Patterns

### Lazy Loading

Load code/data only when needed.

**Apply to:**
- Route-based code splitting
- Below-the-fold components
- Large libraries used in specific features

### Caching Strategy

| Data Type | Cache Strategy |
|-----------|---------------|
| Static assets | Long cache, versioned filenames |
| API responses | Short cache or stale-while-revalidate |
| User data | No cache or very short |
| Public data | Moderate cache |

## Security Patterns

Defer to Security Agent, but follow these basics:

- **Auth tokens:** HttpOnly cookies or secure storage
- **Input validation:** Validate on both client and server
- **SQL injection:** Use parameterized queries always
- **XSS:** Escape output, use CSP headers
- **CORS:** Whitelist specific origins
