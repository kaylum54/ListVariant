# Common Issues to Flag

Patterns and anti-patterns to watch for during code review.

## Logic Errors

### Off-by-One Errors

```typescript
// ❌ Bug: skips last item
for (let i = 0; i < items.length - 1; i++) { }

// ❌ Bug: includes one extra
for (let i = 0; i <= items.length; i++) { }

// ✅ Correct
for (let i = 0; i < items.length; i++) { }
```

### Null/Undefined Access

```typescript
// ❌ Bug: crashes if user is null
const name = user.profile.name;

// ✅ Safe
const name = user?.profile?.name;

// ✅ With default
const name = user?.profile?.name ?? 'Unknown';
```

### Incorrect Comparisons

```typescript
// ❌ Bug: type coercion issues
if (value == null) { }
if (status == "active") { }

// ✅ Strict equality
if (value === null || value === undefined) { }
if (status === "active") { }
```

### Missing Await

```typescript
// ❌ Bug: doesn't wait, returns Promise
function getUser(id) {
  return fetchUser(id); // missing await, but maybe intentional?
}

// ❌ Bug: forEach doesn't await
items.forEach(async (item) => {
  await processItem(item);
});

// ✅ Correct
for (const item of items) {
  await processItem(item);
}
// or
await Promise.all(items.map(item => processItem(item)));
```

### Race Conditions

```typescript
// ❌ Bug: race condition in React
const [count, setCount] = useState(0);
const increment = () => {
  setCount(count + 1); // Stale closure
  setCount(count + 1); // Both use same stale value
};

// ✅ Correct
const increment = () => {
  setCount(c => c + 1);
  setCount(c => c + 1);
};
```

## Error Handling Issues

### Silent Failures

```typescript
// ❌ Bug: swallows errors
try {
  await saveData(data);
} catch (e) {
  // ignore
}

// ✅ Handle appropriately
try {
  await saveData(data);
} catch (e) {
  logger.error('Failed to save data', { error: e, data });
  throw new DataSaveError('Could not save data');
}
```

### Catching Too Broadly

```typescript
// ❌ Bug: catches everything including programming errors
try {
  const result = processData(data);
  return result.value; // TypeError if result is undefined
} catch (e) {
  return null; // Hides the bug
}

// ✅ Catch specific errors
try {
  const result = processData(data);
  return result.value;
} catch (e) {
  if (e instanceof ValidationError) {
    return null;
  }
  throw e; // Re-throw unexpected errors
}
```

### Error Information Loss

```typescript
// ❌ Bug: loses original error
try {
  await fetchData();
} catch (e) {
  throw new Error('Failed to fetch');
}

// ✅ Preserve context
try {
  await fetchData();
} catch (e) {
  throw new Error(`Failed to fetch: ${e.message}`, { cause: e });
}
```

## Performance Issues

### N+1 Queries

```typescript
// ❌ Bug: N+1 query
const users = await getUsers();
for (const user of users) {
  user.posts = await getPostsByUser(user.id); // Query per user!
}

// ✅ Batch query
const users = await getUsers();
const userIds = users.map(u => u.id);
const posts = await getPostsByUsers(userIds);
const postsByUser = groupBy(posts, 'userId');
users.forEach(user => {
  user.posts = postsByUser[user.id] || [];
});
```

### React Re-render Triggers

```typescript
// ❌ Bug: new object every render
<MyComponent style={{ color: 'red' }} />
<MyComponent items={data.filter(x => x.active)} />
<MyComponent onClick={() => handleClick(id)} />

// ✅ Stable references
const style = useMemo(() => ({ color: 'red' }), []);
const activeItems = useMemo(() => data.filter(x => x.active), [data]);
const handleItemClick = useCallback(() => handleClick(id), [id]);

<MyComponent style={style} />
<MyComponent items={activeItems} />
<MyComponent onClick={handleItemClick} />
```

### Missing Pagination

```typescript
// ❌ Bug: loads entire table
const allUsers = await db.users.findMany();

// ✅ Paginated
const users = await db.users.findMany({
  take: 20,
  skip: page * 20,
});
```

### Memory Leaks

```typescript
// ❌ Bug: event listener never removed
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// ✅ Cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

## Security Red Flags

### SQL Injection

```typescript
// ❌ CRITICAL: SQL injection
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ Parameterized query
const query = `SELECT * FROM users WHERE id = $1`;
await db.query(query, [userId]);
```

### XSS Vulnerabilities

```typescript
// ❌ CRITICAL: XSS
element.innerHTML = userInput;
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Safe
element.textContent = userInput;
<div>{userContent}</div> // React escapes by default
```

### Secrets in Code

```typescript
// ❌ CRITICAL: hardcoded secrets
const API_KEY = 'sk_live_abc123';
const DB_PASSWORD = 'supersecret';

// ✅ Environment variables
const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;
```

### Missing Auth Checks

```typescript
// ❌ Bug: no authorization check
app.delete('/api/posts/:id', async (req, res) => {
  await db.posts.delete({ id: req.params.id });
  res.json({ success: true });
});

// ✅ Check ownership
app.delete('/api/posts/:id', async (req, res) => {
  const post = await db.posts.findUnique({ id: req.params.id });
  if (post.authorId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  await db.posts.delete({ id: req.params.id });
  res.json({ success: true });
});
```

## Code Smell Patterns

### God Functions

```typescript
// ❌ Smell: function doing too much
function processOrder(order) {
  // Validate (20 lines)
  // Calculate totals (30 lines)
  // Apply discounts (25 lines)
  // Process payment (40 lines)
  // Send notifications (20 lines)
  // Update inventory (15 lines)
}

// ✅ Single responsibility
function processOrder(order) {
  validateOrder(order);
  const totals = calculateTotals(order);
  const finalAmount = applyDiscounts(totals, order.discountCode);
  await processPayment(order, finalAmount);
  await sendOrderConfirmation(order);
  await updateInventory(order.items);
}
```

### Primitive Obsession

```typescript
// ❌ Smell: too many primitives
function createUser(
  firstName: string,
  lastName: string,
  email: string,
  street: string,
  city: string,
  state: string,
  zip: string,
  phone: string
) { }

// ✅ Use objects
interface UserInput {
  name: { first: string; last: string };
  email: string;
  address: Address;
  phone: string;
}
function createUser(input: UserInput) { }
```

### Boolean Blindness

```typescript
// ❌ Smell: unclear what boolean means
processOrder(order, true, false, true);

// ✅ Named options
processOrder(order, {
  sendConfirmation: true,
  skipValidation: false,
  priority: true,
});
```

### Magic Numbers

```typescript
// ❌ Smell: what does 86400 mean?
const expiry = Date.now() + 86400 * 1000;
if (retries > 3) { }

// ✅ Named constants
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RETRIES = 3;

const expiry = Date.now() + ONE_DAY_MS;
if (retries > MAX_RETRIES) { }
```

### Dead Code

```typescript
// ❌ Smell: commented out code
function calculate(x) {
  // const oldResult = x * 2;
  // if (useOldMethod) {
  //   return oldResult;
  // }
  return x * 3;
}

// ✅ Delete it (git has history)
function calculate(x) {
  return x * 3;
}
```

## Testing Issues

### Tests That Don't Assert

```typescript
// ❌ Bug: no assertion
test('creates user', async () => {
  const user = await createUser({ name: 'James' });
  // Test passes even if createUser throws!
});

// ✅ Actually assert
test('creates user', async () => {
  const user = await createUser({ name: 'James' });
  expect(user.name).toBe('James');
  expect(user.id).toBeDefined();
});
```

### Testing Implementation

```typescript
// ❌ Smell: testing how, not what
test('calls setState', () => {
  const spy = jest.spyOn(component, 'setState');
  component.updateName('James');
  expect(spy).toHaveBeenCalledWith({ name: 'James' });
});

// ✅ Test behavior
test('updates displayed name', () => {
  component.updateName('James');
  expect(component.getName()).toBe('James');
});
```

### Shared Test State

```typescript
// ❌ Bug: tests affect each other
let user;

beforeAll(async () => {
  user = await createUser();
});

test('can update user', async () => {
  await updateUser(user.id, { name: 'New Name' });
});

test('can fetch user', async () => {
  const fetched = await getUser(user.id);
  expect(fetched.name).toBe('James'); // Fails! Previous test changed it
});

// ✅ Independent tests
test('can update user', async () => {
  const user = await createUser();
  await updateUser(user.id, { name: 'New Name' });
  // ...
});

test('can fetch user', async () => {
  const user = await createUser();
  const fetched = await getUser(user.id);
  // ...
});
```

## Quick Reference

### Always Flag (🔴)

- SQL/NoSQL injection
- Missing authentication/authorization
- Secrets in code
- Silent error swallowing
- Obvious crash bugs

### Usually Flag (🟡)

- Missing null checks on external data
- Missing error handling
- N+1 queries
- Memory leaks
- Missing tests for new logic

### Consider Flagging (🟢)

- Minor performance improvements
- Naming suggestions
- Code organization improvements
- Additional test cases
