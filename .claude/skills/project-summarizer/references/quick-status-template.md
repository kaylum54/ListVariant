# Quick Status Template

Abbreviated summary format for quick syncs and progress checks.

## When to Use

- Daily standups
- Quick context refresh
- Progress checks
- When full summary is overkill

## Template

```markdown
# Quick Status: [Project Name]

**Date:** [Date]
**Status:** [On Track | Needs Attention | Blocked]

## What's Working
- [Feature/component]
- [Feature/component]

## In Progress
- [ ] [Current task] — [status/blocker]
- [ ] [Current task] — [status/blocker]

## Blocked
- [Blocker] — waiting on [what]

## Next Up
1. [Immediate next task]
2. [Following task]

## Key Files Changed Recently
- `path/to/file.ts` — [what changed]
- `path/to/file.ts` — [what changed]

## Notes
[Anything important to remember]
```

## Example

```markdown
# Quick Status: TaskFlow App

**Date:** January 31, 2025
**Status:** On Track

## What's Working
- User authentication (login/signup/logout)
- Task CRUD operations
- Basic dashboard view

## In Progress
- [ ] Task filtering — UI done, API endpoint needs work
- [ ] Due date reminders — researching notification approach

## Blocked
- Email notifications — waiting on SendGrid API key

## Next Up
1. Finish task filtering API
2. Add task sorting
3. Implement due date picker

## Key Files Changed Recently
- `src/api/tasks.ts` — added filter params
- `src/components/TaskFilter.tsx` — new component
- `prisma/schema.prisma` — added dueDate field

## Notes
- Decided to use date-fns over moment.js (smaller bundle)
- Need to add indexes on tasks table for filtering perf
```

## Comparison: Quick Status vs Full Summary

| Aspect | Quick Status | Full Summary |
|--------|--------------|--------------|
| Length | < 1 page | 3-10 pages |
| Time to create | 2-5 minutes | 15-30 minutes |
| Use case | Daily sync | Checkpoints, handoffs |
| Detail level | High-level only | Comprehensive |
| Tech stack | Omitted | Full documentation |
| Architecture | Omitted | Detailed |
| File structure | Recent changes only | Full overview |

## When to Upgrade to Full Summary

Upgrade from Quick Status to Full Summary when:

- Starting a new conversation/chat
- Before major refactoring
- Handing off to someone else
- More than a week since last full summary
- Significant architectural changes made
- Quick status is getting too long
