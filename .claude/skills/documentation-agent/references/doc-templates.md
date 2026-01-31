# Document Templates

Ready-to-use templates for common documentation types.

## Architecture Decision Record (ADR)

```markdown
# ADR-[NUMBER]: [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context

[What is the issue that we're seeing that motivates this decision?]

## Decision

[What is the change that we're proposing and/or doing?]

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Drawback 1]
- [Drawback 2]

### Neutral
- [Side effect that is neither positive nor negative]

## Alternatives Considered

### [Alternative 1]
- Description: [Brief description]
- Rejected because: [Reason]

### [Alternative 2]
- Description: [Brief description]
- Rejected because: [Reason]

---

**Date**: [YYYY-MM-DD]
**Deciders**: [Names/roles involved]
**Consulted**: [Names/roles consulted]
```

## Technical Specification

```markdown
# Technical Specification: [Feature/System Name]

## Overview

### Purpose
[One paragraph explaining what this feature/system does and why it exists]

### Scope
- **In scope**: [What this covers]
- **Out of scope**: [What this explicitly does not cover]

## Background

[Context needed to understand this specification]

## Requirements

### Functional Requirements
1. [FR-1] [Description]
2. [FR-2] [Description]

### Non-Functional Requirements
1. [NFR-1] Performance: [Description]
2. [NFR-2] Security: [Description]
3. [NFR-3] Scalability: [Description]

## Design

### High-Level Design
[Describe the overall approach, include diagrams if helpful]

### Component Design
[Break down into components/modules]

#### [Component 1]
- **Responsibility**: [What it does]
- **Interfaces**: [How other components interact with it]
- **Dependencies**: [What it depends on]

### Data Model
[Describe data structures, database schemas if applicable]

### API Design
[Describe API endpoints, request/response formats]

## Implementation Plan

### Phase 1: [Name]
- [ ] Task 1
- [ ] Task 2

### Phase 2: [Name]
- [ ] Task 3
- [ ] Task 4

## Testing Strategy

- **Unit tests**: [Approach]
- **Integration tests**: [Approach]
- **E2E tests**: [Approach]

## Rollout Plan

[How will this be deployed? Feature flags? Gradual rollout?]

## Monitoring & Observability

[What metrics, logs, alerts will be in place?]

## Open Questions

- [ ] [Question 1]
- [ ] [Question 2]

---

**Author**: [Name]
**Reviewers**: [Names]
**Created**: [Date]
**Last Updated**: [Date]
```

## API Endpoint Documentation

```markdown
# [HTTP Method] [Endpoint Path]

[Brief description of what this endpoint does]

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token |
| `Content-Type` | Yes | `application/json` |

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Resource identifier |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 20 | Max items to return |
| `offset` | integer | No | 0 | Pagination offset |

### Request Body

\`\`\`json
{
  "field1": "string",
  "field2": 123,
  "nested": {
    "subfield": "value"
  }
}
\`\`\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `field1` | string | Yes | Description |
| `field2` | integer | No | Description |

## Response

### Success Response

**Status**: `200 OK`

\`\`\`json
{
  "data": {
    "id": "abc123",
    "field1": "value"
  },
  "meta": {
    "timestamp": "2025-01-31T12:00:00Z"
  }
}
\`\`\`

### Error Responses

**Status**: `400 Bad Request`

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'field1' is required",
    "details": {
      "field": "field1"
    }
  }
}
\`\`\`

**Status**: `401 Unauthorized`

\`\`\`json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
\`\`\`

**Status**: `404 Not Found`

\`\`\`json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
\`\`\`

## Examples

### cURL

\`\`\`bash
curl -X POST https://api.example.com/v1/resource \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field1": "value"}'
\`\`\`

### JavaScript

\`\`\`javascript
const response = await fetch('https://api.example.com/v1/resource', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ field1: 'value' }),
});
\`\`\`

## Notes

- [Any additional notes, rate limits, etc.]

---

**Last Updated**: [Date]
```

## Setup Guide

```markdown
# Development Setup Guide

This guide will help you set up the project for local development.

## Prerequisites

Before you begin, ensure you have:

- [ ] Node.js v18+ installed
- [ ] npm or pnpm installed
- [ ] Git installed
- [ ] [Other prerequisites]

## Quick Start

\`\`\`bash
# Clone the repository
git clone [repo-url]
cd [project-name]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
\`\`\`

The application should now be running at `http://localhost:3000`.

## Detailed Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `API_KEY` | External API key | Yes |
| `DEBUG` | Enable debug mode | No |

### 2. Database Setup

\`\`\`bash
# Run migrations
npm run db:migrate

# Seed development data (optional)
npm run db:seed
\`\`\`

### 3. Running Tests

\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage
\`\`\`

## Common Issues

### Issue: [Description]

**Symptom**: [What you see]

**Solution**: [How to fix it]

### Issue: [Description]

**Symptom**: [What you see]

**Solution**: [How to fix it]

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- [Other extensions]

### Settings

\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
\`\`\`

## Next Steps

- Read the [Architecture Overview](./architecture/overview.md)
- Review the [Contributing Guidelines](./CONTRIBUTING.md)
- Check out [open issues](link-to-issues)

---

**Last Updated**: [Date]
**Questions?** Ask in #[channel] or contact [person/team]
```

## Project Status Report

```markdown
# Project Status Report

**Project**: [Project Name]
**Period**: [Date Range]
**Author**: Project Lead
**Status**: [On Track | At Risk | Blocked]

## Executive Summary

[2-3 sentences summarizing current state]

## Progress

### Completed This Period
- [x] [Completed item 1]
- [x] [Completed item 2]
- [x] [Completed item 3]

### In Progress
- [ ] [Item 1] — [% complete or status]
- [ ] [Item 2] — [% complete or status]

### Planned for Next Period
- [ ] [Upcoming item 1]
- [ ] [Upcoming item 2]

## Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| [Metric 1] | [Target] | [Actual] | 🟢/🟡/🔴 |
| [Metric 2] | [Target] | [Actual] | 🟢/🟡/🔴 |

## Risks & Issues

### Active Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Action] |

### Active Issues

| Issue | Impact | Owner | ETA |
|-------|--------|-------|-----|
| [Issue 1] | [Impact] | [Owner] | [Date] |

## Agent Status

| Agent | Status | Notes |
|-------|--------|-------|
| Senior Developer | 🟢 Active | [Notes] |
| Dev Team | 🟢 Active | [Notes] |
| Security Agent | 🟡 Pending | Audit scheduled for [date] |
| Documentation | 🟢 Active | [Notes] |

## Decisions Made

- [Decision 1] — See ADR-XXX
- [Decision 2] — See ADR-XXX

## Upcoming Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| [Milestone 1] | [Date] | [Status] |
| [Milestone 2] | [Date] | [Status] |

## Notes

[Any additional context or commentary]

---

**Next Report**: [Date]
**Distribution**: [Who receives this report]
```

## Contributing Guidelines

```markdown
# Contributing to [Project Name]

Thank you for your interest in contributing!

## Getting Started

1. Read the [Setup Guide](./guides/setup.md)
2. Review the [Architecture Overview](./architecture/overview.md)
3. Check [open issues](link) for something to work on

## Development Workflow

### 1. Create a Branch

\`\`\`bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
\`\`\`

Branch naming:
- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation only
- `refactor/` — Code refactoring

### 2. Make Changes

- Follow existing code style
- Add tests for new functionality
- Update documentation if needed

### 3. Commit

Write clear commit messages:

\`\`\`
type: brief description

Longer explanation if needed.

Closes #123
\`\`\`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 4. Submit PR

- Fill out the PR template
- Link related issues
- Request review from appropriate team members

## Code Standards

- [Language-specific standards]
- Run `npm run lint` before committing
- Ensure tests pass with `npm run test`

## Review Process

1. Automated checks must pass
2. At least one approval required
3. Address all review comments
4. Squash and merge

## Questions?

- Check existing documentation
- Ask in #[channel]
- Contact [person/team]

---

**Last Updated**: [Date]
```
