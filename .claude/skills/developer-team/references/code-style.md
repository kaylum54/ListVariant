# Code Style Guide

Standards for writing clean, consistent code.

## Core Principles

1. **Readability over cleverness** — Code is read more than written
2. **Consistency over preference** — Match the codebase, not your style
3. **Explicit over implicit** — Clear intent beats fewer characters
4. **Simple over complex** — The simplest solution that works

## General Rules

### Naming

**Variables and functions:** Use descriptive names that explain purpose.

```typescript
// ❌ Bad
const d = new Date();
const u = getUser();
function calc(a, b) { }

// ✅ Good
const createdAt = new Date();
const currentUser = getUser();
function calculateDiscount(price, percentage) { }
```

**Booleans:** Use prefixes like `is`, `has`, `should`, `can`.

```typescript
// ❌ Bad
const loading = true;
const admin = user.role === 'admin';

// ✅ Good
const isLoading = true;
const isAdmin = user.role === 'admin';
```

**Constants:** Use SCREAMING_SNAKE_CASE for true constants.

```typescript
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
```

### Functions

**Keep functions small:** One function, one responsibility.

```typescript
// ❌ Bad: Doing too much
function processOrder(order) {
  // validate
  // calculate total
  // apply discounts
  // charge payment
  // send email
  // update inventory
}

// ✅ Good: Single responsibility
function validateOrder(order) { }
function calculateOrderTotal(order) { }
function applyDiscounts(order) { }
function processPayment(order) { }
function sendOrderConfirmation(order) { }
function updateInventory(order) { }
```

**Limit parameters:** More than 3 parameters? Use an object.

```typescript
// ❌ Bad
function createUser(name, email, age, role, department, startDate) { }

// ✅ Good
function createUser({ name, email, age, role, department, startDate }) { }
```

**Return early:** Avoid deep nesting with early returns.

```typescript
// ❌ Bad: Deep nesting
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // do the thing
      }
    }
  }
}

// ✅ Good: Early returns
function processUser(user) {
  if (!user) return;
  if (!user.isActive) return;
  if (!user.hasPermission) return;
  
  // do the thing
}
```

### Comments

**Comment why, not what:** Code shows what; comments explain why.

```typescript
// ❌ Bad: Describes the obvious
// Increment counter by 1
counter++;

// ✅ Good: Explains the non-obvious
// Offset by 1 because the API uses 1-based indexing
const pageNumber = index + 1;
```

**Use comments sparingly:** If code needs lots of comments, consider rewriting it.

**TODO format:** Include context and ideally a ticket reference.

```typescript
// TODO: Refactor once auth service is updated (PROJ-123)
// TODO(james): Revisit after performance benchmarking
```

### Error Handling

**Be specific with errors:** Don't swallow errors silently.

```typescript
// ❌ Bad: Silent failure
try {
  await saveUser(user);
} catch (e) {
  // ignore
}

// ❌ Bad: Generic error
try {
  await saveUser(user);
} catch (e) {
  throw new Error('Something went wrong');
}

// ✅ Good: Specific error with context
try {
  await saveUser(user);
} catch (e) {
  throw new UserSaveError(`Failed to save user ${user.id}: ${e.message}`);
}
```

**Handle errors at the right level:** Don't catch errors just to rethrow them unchanged.

### Type Safety (TypeScript)

**Avoid `any`:** Use proper types or `unknown` if truly unknown.

```typescript
// ❌ Bad
function process(data: any) { }

// ✅ Good
function process(data: UserInput) { }
function process(data: unknown) { /* with runtime validation */ }
```

**Use type inference:** Don't over-annotate when TypeScript can infer.

```typescript
// ❌ Redundant
const name: string = 'James';
const users: User[] = getUsers(); // getUsers already returns User[]

// ✅ Let TypeScript infer
const name = 'James';
const users = getUsers();
```

## Formatting

Rely on automated tools (Prettier, ESLint) for formatting. Don't bikeshed on:
- Tabs vs spaces (use project setting)
- Quote style (use project setting)
- Line length (use project setting)

If the project has a formatter, use it. If it doesn't, suggest adding one.

## TypeScript-Specific

### Prefer interfaces for objects

```typescript
// ✅ Preferred for object shapes
interface User {
  id: string;
  name: string;
}

// Use type for unions, intersections, primitives
type Status = 'pending' | 'active' | 'cancelled';
type UserWithRole = User & { role: string };
```

### Use const assertions for literal types

```typescript
// ❌ Inferred as string[]
const statuses = ['pending', 'active', 'cancelled'];

// ✅ Inferred as readonly ['pending', 'active', 'cancelled']
const statuses = ['pending', 'active', 'cancelled'] as const;
```

### Avoid enums, prefer union types

```typescript
// ❌ Enums have quirks
enum Status {
  Pending,
  Active,
  Cancelled
}

// ✅ Union types are simpler
type Status = 'pending' | 'active' | 'cancelled';
```

## React-Specific

### Component structure

```tsx
// 1. Imports
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import type { User } from '@/types';

// 2. Types
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

// 3. Component
export function UserProfile({ user, onUpdate }: UserProfileProps) {
  // 3a. Hooks
  const [isEditing, setIsEditing] = useState(false);
  
  // 3b. Derived state
  const displayName = user.firstName + ' ' + user.lastName;
  
  // 3c. Effects
  useEffect(() => {
    // ...
  }, [user.id]);
  
  // 3d. Handlers
  const handleSave = () => {
    // ...
  };
  
  // 3e. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### Prefer named exports

```typescript
// ❌ Default exports are harder to refactor
export default function UserProfile() { }

// ✅ Named exports are explicit
export function UserProfile() { }
```

### Extract complex logic into hooks

```typescript
// ❌ Complex logic in component
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // fetch logic...
  }, [userId]);
  
  // ...
}

// ✅ Extract to custom hook
function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);
  // ...
}
```

## API-Specific (Node.js)

### Controller structure

```typescript
// Controllers are thin - validation and delegation only
export async function createUser(req: Request, res: Response) {
  // 1. Validate input
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }
  
  // 2. Delegate to service
  const user = await userService.create(parsed.data);
  
  // 3. Return response
  return res.status(201).json({ data: user });
}
```

### Service structure

```typescript
// Services contain business logic
export async function createUser(input: CreateUserInput): Promise<User> {
  // Business logic, validation, orchestration
  const existingUser = await userRepository.findByEmail(input.email);
  if (existingUser) {
    throw new ConflictError('Email already in use');
  }
  
  const hashedPassword = await hashPassword(input.password);
  
  return userRepository.create({
    ...input,
    password: hashedPassword,
  });
}
```

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Instead |
|--------------|---------|---------|
| Magic numbers | `if (status === 3)` | Use named constants |
| God functions | 200+ line functions | Split into smaller functions |
| Deep nesting | 4+ levels of indentation | Early returns, extract functions |
| Commented-out code | Dead code clutter | Delete it (git has history) |
| Copy-paste code | Duplication | Extract shared function |
| Premature abstraction | Abstraction before need | Wait for the third instance |
| Inconsistent naming | `getUser`, `fetchAccount`, `retrieveOrder` | Pick one verb, use everywhere |

## When in Doubt

1. **Look at existing code** — Match the patterns
2. **Ask Senior Developer** — They'll clarify standards
3. **Keep it simple** — Complexity is rarely the answer
4. **Write a test** — If it's hard to test, reconsider the design
