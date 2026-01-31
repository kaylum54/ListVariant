# Testing Guide

Standards and practices for writing effective tests.

## Testing Philosophy

- **Tests are documentation** — They show how code is meant to be used
- **Tests enable change** — Confident refactoring requires good tests
- **Tests should be fast** — Slow tests don't get run
- **Tests should be reliable** — Flaky tests erode trust

## Test Types

### Unit Tests

Test individual functions or components in isolation.

**Characteristics:**
- Fast (milliseconds)
- No external dependencies (mocked)
- Test one thing per test
- High volume, low cost

**When to write:**
- Business logic
- Utility functions
- Component rendering logic
- Data transformations

### Integration Tests

Test multiple components working together.

**Characteristics:**
- Slower (seconds)
- May include real dependencies (database, API)
- Test workflows or features
- Medium volume, medium cost

**When to write:**
- API endpoints
- Database operations
- Multi-step workflows
- Component interactions

### End-to-End (E2E) Tests

Test the full application from user perspective.

**Characteristics:**
- Slowest (10+ seconds)
- Real browser, real backend
- Test critical user journeys
- Low volume, high cost

**When to write:**
- Critical user flows (signup, checkout)
- Cross-feature interactions
- Smoke tests for deployments

## Test Structure

### AAA Pattern

Every test follows: **Arrange, Act, Assert**

```typescript
test('calculates total with discount', () => {
  // Arrange - Set up test data
  const cart = {
    items: [{ price: 100 }, { price: 50 }],
    discountPercent: 10
  };
  
  // Act - Perform the action
  const total = calculateTotal(cart);
  
  // Assert - Verify the result
  expect(total).toBe(135); // 150 - 10%
});
```

### Test Naming

Use descriptive names that explain what's being tested:

```typescript
// ❌ Bad - vague
test('works correctly', () => { });
test('handles edge case', () => { });

// ✅ Good - descriptive
test('returns empty array when no users match filter', () => { });
test('throws ValidationError when email format is invalid', () => { });
test('retries request up to 3 times on network failure', () => { });
```

### Grouping Tests

Use `describe` blocks to organize related tests:

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    test('creates user with valid input', () => { });
    test('throws error when email already exists', () => { });
    test('hashes password before storing', () => { });
  });
  
  describe('deleteUser', () => {
    test('removes user from database', () => { });
    test('throws error when user not found', () => { });
  });
});
```

## Writing Good Tests

### Test Behavior, Not Implementation

```typescript
// ❌ Bad - tests implementation details
test('calls setState with new value', () => {
  const setStateSpy = jest.spyOn(component, 'setState');
  component.updateName('James');
  expect(setStateSpy).toHaveBeenCalledWith({ name: 'James' });
});

// ✅ Good - tests behavior
test('displays updated name after change', () => {
  component.updateName('James');
  expect(component.getName()).toBe('James');
});
```

### One Assertion Per Concept

Keep tests focused. Multiple assertions are fine if they verify the same concept:

```typescript
// ✅ OK - multiple assertions for same concept
test('creates user with correct properties', () => {
  const user = createUser({ name: 'James', email: 'james@example.com' });
  
  expect(user.name).toBe('James');
  expect(user.email).toBe('james@example.com');
  expect(user.id).toBeDefined();
  expect(user.createdAt).toBeInstanceOf(Date);
});

// ❌ Bad - testing multiple unrelated things
test('user creation', () => {
  const user = createUser({ name: 'James' });
  expect(user.name).toBe('James');
  
  const updated = updateUser(user.id, { name: 'Jim' });
  expect(updated.name).toBe('Jim');
  
  deleteUser(user.id);
  expect(getUser(user.id)).toBeNull();
});
```

### Keep Tests Independent

Tests should not depend on each other or on execution order:

```typescript
// ❌ Bad - depends on previous test
let userId;

test('creates user', () => {
  const user = createUser({ name: 'James' });
  userId = user.id; // Shared state!
});

test('fetches user', () => {
  const user = getUser(userId); // Depends on previous test
  expect(user.name).toBe('James');
});

// ✅ Good - independent
test('creates user', () => {
  const user = createUser({ name: 'James' });
  expect(user.id).toBeDefined();
});

test('fetches user', () => {
  const created = createUser({ name: 'James' });
  const fetched = getUser(created.id);
  expect(fetched.name).toBe('James');
});
```

### Use Factories for Test Data

```typescript
// ❌ Bad - repetitive test data
test('validates user email', () => {
  const user = {
    id: '123',
    name: 'James',
    email: 'invalid',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  expect(validateUser(user)).toBe(false);
});

// ✅ Good - factory with overrides
const createTestUser = (overrides = {}) => ({
  id: 'test-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

test('validates user email', () => {
  const user = createTestUser({ email: 'invalid' });
  expect(validateUser(user)).toBe(false);
});
```

## Mocking

### When to Mock

**Mock:**
- External APIs
- Databases (for unit tests)
- Time/dates
- Random values
- Environment-specific behavior

**Don't mock:**
- The code you're testing
- Simple utilities
- Everything (over-mocking = brittle tests)

### Mocking Examples

```typescript
// Mock a module
jest.mock('@/services/emailService');

// Mock a function
const sendEmail = jest.fn().mockResolvedValue({ sent: true });

// Mock time
jest.useFakeTimers();
jest.setSystemTime(new Date('2025-01-31'));

// Mock API response
server.use(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json({ users: [testUser] }));
  })
);
```

### Verify Mock Calls

```typescript
test('sends welcome email on registration', async () => {
  const sendEmail = jest.fn().mockResolvedValue({ sent: true });
  
  await registerUser({ email: 'james@example.com' }, { sendEmail });
  
  expect(sendEmail).toHaveBeenCalledTimes(1);
  expect(sendEmail).toHaveBeenCalledWith({
    to: 'james@example.com',
    template: 'welcome',
  });
});
```

## React Component Testing

### Testing Library Philosophy

- Test what users see and do
- Query by accessible roles/text, not implementation
- Avoid testing implementation details

```typescript
// ❌ Bad - implementation details
const button = container.querySelector('.submit-btn');
expect(wrapper.state('isSubmitting')).toBe(true);

// ✅ Good - user perspective
const button = screen.getByRole('button', { name: /submit/i });
expect(button).toBeDisabled();
expect(screen.getByText(/loading/i)).toBeInTheDocument();
```

### Component Test Example

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  test('submits form with email and password', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    // Fill in form
    await userEvent.type(
      screen.getByLabelText(/email/i),
      'james@example.com'
    );
    await userEvent.type(
      screen.getByLabelText(/password/i),
      'password123'
    );
    
    // Submit
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'james@example.com',
      password: 'password123',
    });
  });
  
  test('shows error for invalid email', async () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });
});
```

## API Testing

```typescript
import request from 'supertest';
import { app } from '@/app';
import { createTestUser, cleanupDatabase } from '@/test/helpers';

describe('POST /api/users', () => {
  afterEach(async () => {
    await cleanupDatabase();
  });
  
  test('creates user with valid input', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'James',
        email: 'james@example.com',
        password: 'securePassword123',
      })
      .expect(201);
    
    expect(response.body.data).toMatchObject({
      name: 'James',
      email: 'james@example.com',
    });
    expect(response.body.data.password).toBeUndefined();
  });
  
  test('returns 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'James',
        email: 'invalid',
        password: 'securePassword123',
      })
      .expect(400);
    
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
  
  test('returns 409 when email already exists', async () => {
    await createTestUser({ email: 'james@example.com' });
    
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'James',
        email: 'james@example.com',
        password: 'securePassword123',
      })
      .expect(409);
    
    expect(response.body.error.code).toBe('EMAIL_EXISTS');
  });
});
```

## Test Coverage

### Coverage Goals

- **Not a target:** Don't chase 100% coverage
- **As a signal:** Low coverage in critical code = risk
- **Meaningful coverage:** Cover important paths, not just lines

### What to Prioritize

| Priority | Coverage Focus |
|----------|---------------|
| High | Business logic, validation, security |
| Medium | API endpoints, data transformations |
| Low | UI layout, simple getters/setters |

### Coverage Commands

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Debugging Tests

### Common Issues

**Test passes alone, fails in suite:**
- Shared state between tests
- Missing cleanup in afterEach
- Async operations not awaited

**Test is flaky (sometimes passes, sometimes fails):**
- Race conditions
- Time-dependent code without mocking
- External service dependencies

**Test is slow:**
- Real network calls instead of mocks
- Missing database cleanup
- Unnecessary setup/teardown

### Debugging Tips

```typescript
// Focus on one test
test.only('the test I'm debugging', () => { });

// Skip a problematic test temporarily
test.skip('fix later', () => { });

// Add debugging output
console.log(screen.debug()); // React Testing Library
console.log(JSON.stringify(result, null, 2));
```

## Testing Checklist

Before submitting code, verify:

- [ ] All new code has tests
- [ ] Tests pass locally
- [ ] Tests are independent (can run in any order)
- [ ] Tests are fast (unit tests < 100ms each)
- [ ] No console.log left in tests
- [ ] Test names are descriptive
- [ ] Mocks are appropriate (not over-mocking)
- [ ] Edge cases are covered
- [ ] Error cases are covered
