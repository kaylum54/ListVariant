# Decision Log Format

## Purpose

The decision log captures important project decisions for future reference. It answers: "Why did we do it this way?"

## Decision Record Template

```markdown
## Decision [NUMBER]: [Title]

**Date**: [Date]
**Status**: [Proposed / Accepted / Deprecated / Superseded]
**Decider**: @Project Lead

### Context
[What situation or problem prompted this decision?]

### Decision
[What was decided?]

### Rationale
[Why was this option chosen over alternatives?]

### Alternatives Considered
1. **[Alternative A]**: [Brief description]
   - Pros: [...]
   - Cons: [...]
   - Why rejected: [...]

2. **[Alternative B]**: [Brief description]
   - Pros: [...]
   - Cons: [...]
   - Why rejected: [...]

### Consequences
- [Expected positive outcome 1]
- [Expected positive outcome 2]
- [Potential risk or trade-off]

### Related
- Supersedes: [Previous decision if applicable]
- Related to: [Other decisions]
- Affected agents: [List of agents impacted]
```

## Example Decision Record

```markdown
## Decision 001: Use PostgreSQL for Primary Database

**Date**: 2025-01-15
**Status**: Accepted
**Decider**: @Project Lead

### Context
The project requires a database for user data, transactions, and application state. Need to choose between SQL and NoSQL options.

### Decision
Use PostgreSQL as the primary database.

### Rationale
PostgreSQL provides ACID compliance needed for financial transactions, has excellent JSON support for flexible schemas where needed, and the team has existing expertise.

### Alternatives Considered
1. **MongoDB**
   - Pros: Flexible schema, easy horizontal scaling
   - Cons: No ACID transactions across documents, less suited for relational data
   - Why rejected: Transaction integrity is critical for this project

2. **MySQL**
   - Pros: Widely supported, familiar
   - Cons: Less advanced JSON support, fewer modern features
   - Why rejected: PostgreSQL's JSON and array types better suit our hybrid needs

### Consequences
- Strong data integrity for financial operations
- May need read replicas for scale
- Team can leverage existing PostgreSQL knowledge

### Related
- Affected agents: @Senior Developer, @Security Agent (for database security review)
```

## Decision Categories

Tag decisions by category for easier retrieval:

- **Architecture**: Tech stack, system design, infrastructure
- **Security**: Auth, encryption, access control
- **Process**: Workflows, conventions, standards
- **Integration**: Third-party services, APIs
- **UX**: User experience, interface decisions
- **Performance**: Optimization, scaling choices

## When to Log a Decision

Create a decision record when:

- Choosing between competing technologies
- Establishing a pattern or convention
- Making a trade-off with long-term implications
- Deviating from common practice
- Resolving a conflict between agent recommendations

## Decision Review

Periodically review past decisions:

- Are the assumptions still valid?
- Have consequences played out as expected?
- Should any decisions be revisited?

Mark outdated decisions as `Deprecated` or `Superseded` with reference to the new decision.
