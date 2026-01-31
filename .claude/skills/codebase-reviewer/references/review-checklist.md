# Review Checklist Details

Expanded checklist for thorough code reviews.

## Correctness

### Does the code do what it's supposed to?

- [ ] Read the task/issue to understand the requirement
- [ ] Verify the implementation matches the acceptance criteria
- [ ] Check that all cases mentioned in the task are handled

### Are edge cases handled?

- [ ] Empty inputs (null, undefined, empty string, empty array)
- [ ] Boundary values (0, -1, max values)
- [ ] Single item vs multiple items
- [ ] Invalid inputs
- [ ] Concurrent access (if applicable)

### Is error handling appropriate?

- [ ] Errors are caught at the right level
- [ ] Error messages are meaningful
- [ ] Errors don't expose sensitive information
- [ ] Failed operations don't leave state inconsistent
- [ ] Network/IO failures are handled gracefully

### Are there logic errors?

Common logic errors to check:
- Off-by-one errors in loops
- Incorrect comparison operators (< vs <=)
- Missing break statements in switches
- Incorrect boolean logic (AND vs OR)
- Missing null checks before property access
- Async operations not awaited
- Race conditions in state updates

## Standards Compliance

### Code Style

- [ ] Follows project naming conventions
- [ ] Consistent with existing code patterns
- [ ] No linting errors or warnings
- [ ] Proper indentation and formatting
- [ ] Import organization follows conventions

### Project Patterns

- [ ] Uses established patterns for similar functionality
- [ ] Doesn't introduce new patterns without justification
- [ ] Consistent with architectural decisions
- [ ] File placed in correct location

### TypeScript (if applicable)

- [ ] No `any` types (or justified if present)
- [ ] Proper type definitions
- [ ] No type assertions that hide errors
- [ ] Interfaces/types exported appropriately

## Testing

### Coverage

- [ ] New functionality has tests
- [ ] Happy path is tested
- [ ] Key error cases are tested
- [ ] Edge cases are tested
- [ ] Bug fixes have regression tests

### Test Quality

- [ ] Tests are readable and well-named
- [ ] Tests verify behavior, not implementation
- [ ] Tests are independent (no shared state)
- [ ] Mocks are appropriate (not over-mocking)
- [ ] Assertions are meaningful

### Test Execution

- [ ] All tests pass
- [ ] No skipped tests without explanation
- [ ] Tests don't have hardcoded timeouts
- [ ] Tests clean up after themselves

## Readability

### Naming

- [ ] Variables describe their contents
- [ ] Functions describe their actions
- [ ] Boolean names use is/has/should/can prefixes
- [ ] No single-letter names (except conventional i, j, e)
- [ ] No abbreviations unless universally understood

### Structure

- [ ] Functions are focused (single responsibility)
- [ ] Functions are not too long (guideline: fits on one screen)
- [ ] Nesting is not too deep (max 3-4 levels)
- [ ] Control flow is clear
- [ ] Early returns used to reduce nesting

### Comments

- [ ] Complex logic is explained
- [ ] "Why" is documented, not "what"
- [ ] No commented-out code
- [ ] TODO comments have context/ticket references
- [ ] JSDoc for public APIs (if project uses it)

## Maintainability

### Complexity

- [ ] No unnecessary abstractions
- [ ] No premature optimization
- [ ] No "clever" code that's hard to understand
- [ ] Cyclomatic complexity is reasonable
- [ ] No god objects or god functions

### Dependencies

- [ ] New dependencies are justified
- [ ] Dependencies are up to date
- [ ] No duplicate functionality (using existing utils)
- [ ] Import paths are clean (no ../../..)

### Future-proofing (without over-engineering)

- [ ] Code is extensible where likely to need extension
- [ ] No hardcoded values that will change
- [ ] Configuration is externalized appropriately
- [ ] No tight coupling between unrelated components

## Performance

### Obvious Issues

- [ ] No N+1 query patterns
- [ ] No unnecessary database calls
- [ ] Large lists are paginated
- [ ] Expensive operations are cached where appropriate
- [ ] No memory leaks (event listeners cleaned up)

### React-Specific

- [ ] No inline object/array definitions in props
- [ ] useMemo/useCallback used appropriately
- [ ] Keys are stable and unique in lists
- [ ] No unnecessary re-renders
- [ ] Large components are split appropriately

### API-Specific

- [ ] Response payloads are appropriately sized
- [ ] Queries are indexed
- [ ] No blocking operations in request handlers
- [ ] Rate limiting considered for expensive operations

## Security

> Note: Full security review is Security Agent's domain. Flag obvious issues.

### Obvious Issues to Flag

- [ ] No SQL/NoSQL injection vulnerabilities
- [ ] User input is validated/sanitized
- [ ] No secrets in code
- [ ] Authentication/authorization checked
- [ ] No sensitive data in logs
- [ ] No XSS vulnerabilities (user content escaped)

If you spot security concerns, flag for Security Agent review.

## Documentation

### Code Documentation

- [ ] Public APIs are documented
- [ ] Complex functions have explanatory comments
- [ ] Types serve as documentation

### External Documentation

- [ ] README updated if setup process changed
- [ ] API docs updated if endpoints changed
- [ ] Architecture docs updated if significant changes
- [ ] Flag for Documentation Agent if docs need updates

## PR Quality

### PR Description

- [ ] Clear title explaining the change
- [ ] Description explains what and why
- [ ] Link to task/issue
- [ ] Screenshots for UI changes
- [ ] Breaking changes called out

### PR Size

- [ ] PR is focused on one thing
- [ ] Not too large (guideline: < 500 lines)
- [ ] If large, justified or should be split

### Commits

- [ ] Commits are logical units
- [ ] Commit messages are meaningful
- [ ] No "fix typo" commits (should be squashed)

## Final Checks

Before approving:

- [ ] All checklist items reviewed
- [ ] All blocking issues resolved
- [ ] Re-review any changed files after updates
- [ ] Comfortable with this code in production
