# Agent Communication Templates

## Task Assignment

```markdown
## Task Assignment: [Task Name]

**Assigned to**: @[Agent Name]
**Priority**: [Critical / High / Medium / Low]
**Due**: [Date or Sprint]

### Description
[Clear description of what needs to be done]

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Dependencies
- Requires: [Any prerequisite tasks or agent outputs]
- Blocks: [Any tasks waiting on this]

### Resources
- [Link to relevant docs]
- [Link to related code]
```

## Status Report (Agent → Project Lead)

```markdown
## Status Report: [Agent Name]
**Date**: [Date]
**Sprint**: [Sprint number]

### Summary
[2-3 sentence overview of current status]

### Completed
- [x] [Task 1]
- [x] [Task 2]

### In Progress
- [ ] [Task 3] — [% complete or notes]
- [ ] [Task 4] — [% complete or notes]

### Blockers
| Blocker | Impact | Needed From |
|---------|--------|-------------|
| [Description] | [What's blocked] | [Who can unblock] |

### Recommendations
[Any suggestions for Project Lead consideration]

### Next Steps
1. [Planned action 1]
2. [Planned action 2]
```

## Security Audit Report

```markdown
## Security Audit Report
**Date**: [Date]
**Scope**: [What was audited]
**Auditor**: @Security Agent

### Executive Summary
[Overall security posture: Good / Needs Attention / Critical Issues]

### Findings

#### Critical
| Issue | Location | Recommendation |
|-------|----------|----------------|
| [Issue] | [File/component] | [Fix] |

#### High
| Issue | Location | Recommendation |
|-------|----------|----------------|

#### Medium
| Issue | Location | Recommendation |
|-------|----------|----------------|

#### Low / Informational
| Issue | Location | Recommendation |
|-------|----------|----------------|

### Passed Checks
- [x] [Security check 1]
- [x] [Security check 2]

### Recommendations
[Prioritized list of actions]

### Sign-off
- [ ] All critical issues resolved
- [ ] All high issues resolved or accepted
```

## Code Review Request

```markdown
## Code Review Request

**Submitted by**: @[Agent]
**Reviewer**: @Codebase Reviewer
**PR/Branch**: [Reference]

### Changes Summary
[Brief description of changes]

### Areas of Focus
- [Specific area needing attention]
- [Any concerns or uncertainties]

### Testing Done
- [x] [Test type 1]
- [x] [Test type 2]

### Checklist
- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No security concerns
```

## Escalation Request

```markdown
## Escalation: [Brief Title]

**From**: @[Agent]
**To**: @Project Lead
**Urgency**: [Immediate / Today / This Sprint]

### Issue
[Clear description of the problem]

### Impact
[What's affected if not resolved]

### Options Considered
1. [Option A] — Pros: [...] Cons: [...]
2. [Option B] — Pros: [...] Cons: [...]

### Recommendation
[Agent's suggested approach]

### Decision Needed
[Specific question for Project Lead]
```

## Handoff Document

```markdown
## Handoff: [Component/Feature]

**From**: @[Agent]
**To**: @[Agent]
**Date**: [Date]

### What's Being Handed Off
[Description of the work product]

### Current State
- Status: [Complete / Partial / Draft]
- Location: [File paths or links]

### Context
[Important background the receiving agent needs]

### Known Issues
- [Issue 1]
- [Issue 2]

### Next Steps
[What the receiving agent should do]

### Questions?
[How to reach the handing-off agent if needed]
```
