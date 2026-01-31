# Tech Stack Evaluation Template

Use this template when evaluating technology choices.

## Evaluation Record

```markdown
## Tech Stack Decision: [Category]

**Date**: [Date]
**Decided by**: @Senior Developer
**Approved by**: @Project Lead

### Context

[What problem are we solving? What are the requirements?]

### Options Evaluated

#### Option A: [Technology Name]

**Overview**: [One sentence description]

| Criteria | Score (1-5) | Notes |
|----------|-------------|-------|
| Simplicity | | |
| Team familiarity | | |
| Community/support | | |
| Performance | | |
| Maintenance burden | | |
| Cost | | |
| Reversibility | | |

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Total Score**: [X/35]

#### Option B: [Technology Name]

[Same structure as Option A]

#### Option C: [Technology Name]

[Same structure as Option A]

### Decision

**Selected**: [Technology Name]

**Rationale**: [Why this choice over the others]

**Risks & Mitigations**:
- Risk: [Risk 1] → Mitigation: [How we'll handle it]
- Risk: [Risk 2] → Mitigation: [How we'll handle it]

### Implementation Notes

[Any specific guidance for how to implement/integrate this technology]
```

## Evaluation Criteria Explained

### Simplicity (Weight: High)

- Can a new team member understand it quickly?
- Is the mental model straightforward?
- How much boilerplate/ceremony is required?

**Score guide:**
- 5: Dead simple, obvious
- 3: Moderate learning curve
- 1: Complex, requires significant expertise

### Team Familiarity (Weight: High)

- Has the team used this before?
- How steep is the learning curve?
- Are there team members who can mentor others?

**Score guide:**
- 5: Team is expert
- 3: Some experience, will need ramp-up
- 1: Completely new to everyone

### Community/Support (Weight: Medium)

- Is it actively maintained?
- Good documentation?
- Stack Overflow answers, tutorials, examples?
- Corporate backing or strong community?

**Score guide:**
- 5: Excellent docs, huge community, active development
- 3: Adequate support, moderate community
- 1: Poor docs, small/dying community

### Performance (Weight: Context-Dependent)

- Does it meet our performance requirements?
- Any known bottlenecks?
- Scalability characteristics?

**Score guide:**
- 5: Exceeds requirements, known for performance
- 3: Meets requirements adequately
- 1: Performance concerns, may need workarounds

### Maintenance Burden (Weight: High)

- Upgrade frequency and difficulty?
- Breaking changes history?
- Dependency count and quality?
- Long-term viability?

**Score guide:**
- 5: Stable, minimal maintenance, few dependencies
- 3: Moderate maintenance, manageable dependencies
- 1: Frequent breaking changes, dependency hell

### Cost (Weight: Context-Dependent)

- Licensing costs?
- Infrastructure costs?
- Training/hiring costs?

**Score guide:**
- 5: Free/cheap, no hidden costs
- 3: Moderate cost, budgetable
- 1: Expensive, significant budget impact

### Reversibility (Weight: High)

- How hard is it to switch away?
- Vendor lock-in concerns?
- Data portability?

**Score guide:**
- 5: Easy to replace, standard interfaces
- 3: Moderate switching cost
- 1: Significant lock-in, painful to change

## Quick Decision Shortcuts

For common choices, use these defaults unless there's a compelling reason otherwise:

### Frontend
- **React**: Default choice, massive ecosystem
- **Vue**: Good alternative if team prefers
- **Vanilla JS**: For simple projects or widgets

### Backend
- **Node.js (Express/Fastify)**: Default for JS teams
- **Python (FastAPI)**: Good for data-heavy projects
- **Go**: When performance is critical

### Database
- **PostgreSQL**: Default relational DB
- **SQLite**: For simple projects, embedded use
- **MongoDB**: Only if document model truly fits

### Hosting
- **Vercel/Netlify**: Frontend and simple backends
- **Railway/Render**: Full-stack applications
- **AWS/GCP**: Complex requirements, existing infrastructure

### Auth
- **Clerk/Auth0**: When you need it fast
- **NextAuth**: For Next.js projects
- **Custom**: Only if specific requirements demand it

## Red Flags

Watch out for:

- **"Recommended by [blog/influencer]"** — Not a reason
- **"It's the newest/hottest"** — Not a reason
- **No one else uses it** — High risk
- **Last commit > 1 year ago** — Potentially abandoned
- **License concerns** — Check compatibility
- **Single maintainer** — Bus factor risk
- **Solves problems we don't have** — Over-engineering
