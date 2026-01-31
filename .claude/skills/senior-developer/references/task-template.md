# Dev Team Task Template

Use this template when assigning tasks to the Dev Team.

## Task Assignment Template

```markdown
## Task: [Clear, Action-Oriented Title]

**Assigned to**: @Developer
**Priority**: [Critical / High / Medium / Low]
**Estimate**: [Hours or Story Points]
**Due**: [Date or Sprint]

### What

[2-3 sentences describing what needs to be built]

### Why

[1-2 sentences on the business/user value]

### Acceptance Criteria

- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]

### Technical Guidance

**Approach**: [High-level technical approach]

**Patterns to follow**: 
- [Reference to existing pattern in codebase]
- [Link to relevant architecture doc]

**Files likely involved**:
- `path/to/file1.ts`
- `path/to/file2.ts`

### Gotchas / Things to Watch

- [Known issue or risk 1]
- [Known issue or risk 2]

### Dependencies

- **Blocked by**: [Any prerequisite tasks]
- **Blocks**: [Any tasks waiting on this]

### Out of Scope

- [Thing that might seem related but isn't part of this task]

### Questions?

Ask @Senior Developer if unclear on approach.
```

## Example Task

```markdown
## Task: Implement User Password Reset Flow

**Assigned to**: @Developer
**Priority**: High
**Estimate**: 4 hours
**Due**: Sprint 3

### What

Build the password reset flow allowing users to request a reset link via email and set a new password.

### Why

Users are currently locked out if they forget their password, causing support tickets and churn.

### Acceptance Criteria

- [ ] User can request password reset by entering email
- [ ] Email is sent with secure, time-limited reset link (1 hour expiry)
- [ ] Clicking link allows user to set new password
- [ ] Old password is invalidated after reset
- [ ] User is redirected to login after successful reset
- [ ] Error handling for invalid/expired links

### Technical Guidance

**Approach**: Use the existing email service for sending. Generate a signed token with expiry stored in the password_resets table.

**Patterns to follow**: 
- See existing email verification flow in `/src/features/auth/verify-email/`
- Token generation pattern in `/src/shared/utils/tokens.ts`

**Files likely involved**:
- `src/features/auth/password-reset/` (new)
- `src/api/routes/auth.ts`
- `src/services/emailService.ts`

### Gotchas / Things to Watch

- Don't reveal whether email exists in system (security)
- Make sure reset invalidates all existing sessions
- Rate limit reset requests to prevent abuse

### Dependencies

- **Blocked by**: None
- **Blocks**: "Account security settings" task

### Out of Scope

- Password strength requirements (separate task)
- "Remember this device" functionality

### Questions?

Ask @Senior Developer if unclear on token approach.
```

## Task Sizing Guide

| Size | Hours | Characteristics |
|------|-------|-----------------|
| XS | < 2 | Single file change, clear solution |
| S | 2-4 | Few files, straightforward pattern |
| M | 4-8 | Multiple files, some complexity |
| L | 8-16 | Cross-cutting concern, new pattern |
| XL | 16+ | Should probably be broken down |

**Rule of thumb**: If a task is XL, break it into smaller tasks.

## Task Quality Checklist

Before assigning, verify:

- [ ] Title is clear and action-oriented
- [ ] Acceptance criteria are specific and testable
- [ ] Technical approach is outlined (not prescribed in detail)
- [ ] Relevant patterns/examples are referenced
- [ ] Dependencies are identified
- [ ] Scope is clear (including out of scope)
- [ ] Estimate is realistic

## When Dev Team Gets Stuck

If a developer is stuck for > 30 minutes:

1. **Identify the blocker** — What specifically is unclear?
2. **Check if it's a task problem** — Is the task well-defined?
3. **Provide direction** — Clarify approach, don't write the code
4. **Pair if needed** — Work through the hard part together
5. **Update the task** — Add clarity for future similar tasks

## Feedback Loop

After task completion:

1. **Was the estimate accurate?** — Adjust future estimates
2. **Were there surprises?** — Document for similar tasks
3. **Was the guidance sufficient?** — Improve templates
4. **Any new patterns?** — Document for the team
