# Virtual Development Team — Skill Collection

A complete set of specialist agent skills that work together as a virtual software development team. Drop these skills into any project to get consistent, high-quality guidance across all aspects of development.

## Overview

This collection provides 9 specialist agents that cover the full software development lifecycle:

```
                    ┌─────────────────┐
                    │  PROJECT LEAD   │
                    │  (Coordinator)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│ SENIOR DEV    │  │ DOCUMENTATION   │  │ SPECIALIST AGENTS   │
│ + Dev Team    │  │ AGENT           │  │ Security, SEO, etc. │
└───────┬───────┘  └─────────────────┘  └─────────────────────┘
        │                    
        ▼                    
┌───────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│ STRUCTURE     │  │ CODEBASE        │  │ PROJECT             │
│ AGENT         │  │ REVIEWER        │  │ SUMMARIZER          │
└───────────────┘  └─────────────────┘  └─────────────────────┘
```

## The Agents

| Agent | Role | Key Responsibilities |
|-------|------|---------------------|
| **Project Lead** | Coordinator | Vision, scope, team coordination, final decisions |
| **Senior Developer** | Technical Authority | Architecture proposals, tech stack, Dev Team guidance |
| **Structure Agent** | Organization | File structure, naming conventions, module boundaries |
| **Documentation Agent** | Knowledge Keeper | All docs, reports, decision logs, changelogs |
| **Developer Team** | Builders | Feature implementation, bug fixes, tests |
| **Codebase Reviewer** | Quality Gate | Code review, standards enforcement, bug detection |
| **Security Agent** | Security Authority | Vulnerabilities, auth flows, security audits |
| **SEO & Marketing Agent** | Visibility | Landing pages, SEO, conversion optimization |
| **Project Summarizer** | Context Keeper | Project snapshots, state capture, context continuity |

## Installation

1. Copy the `.skill` files (or skill folders) to your project's skills directory
2. The skills will automatically trigger based on context

**File structure:**
```
your-project/
├── skills/
│   ├── project-lead/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── senior-developer/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── structure-agent/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── documentation-agent/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── developer-team/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── codebase-reviewer/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── security-agent/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── seo-marketing-agent/
│   │   ├── SKILL.md
│   │   └── references/
│   └── project-summarizer/
│       ├── SKILL.md
│       └── references/
└── [your project files]
```

## Hierarchy & Reporting

All agents report to the **Project Lead**, who ensures alignment with project vision:

- **Senior Developer** proposes architecture → **Project Lead** approves
- **Security Agent** identifies risks → **Project Lead** accepts or rejects risk
- **All agents** can escalate blockers → **Project Lead** resolves

The **Senior Developer** has authority over the **Developer Team** for technical decisions that don't affect scope.

## Role Ownership Matrix

Each agent owns a specific axis to prevent overlap:

| Concern | Owner | NOT Owned By |
|---------|-------|--------------|
| Project vision & scope | Project Lead | Anyone else |
| Architecture decisions | Senior Developer (proposes) → Project Lead (approves) | Structure Agent, Dev Team |
| File/folder organization | Structure Agent | Senior Developer, Dev Team |
| Code correctness | Codebase Reviewer | Senior Developer |
| Security assessment | Security Agent | Codebase Reviewer |
| Documentation | Documentation Agent | Dev Team |
| Implementation | Developer Team | Senior Developer |
| SEO & marketing | SEO & Marketing Agent | Dev Team |

## Key Principles

### Quality-First Engineering
The Senior Developer and team prioritize maintainable, readable, well-tested code. No shortcuts.

### Clear Boundaries
Each agent knows what they own and what they don't. When in doubt, escalate.

### Ambiguity Handling
Every agent has explicit guidance for handling unclear situations:
- Ask clarifying questions (max 2)
- Propose options with tradeoffs
- State assumptions explicitly
- Default to reversible choices

### Anti-Overengineering
The Senior Developer has an explicit mandate to prevent:
- "We might need this later" abstractions
- Premature optimization
- Framework worship
- Architectural astronautics

## Workflow Example

### Starting a New Project

1. **Project Lead** gathers requirements, defines scope
2. **Senior Developer** proposes architecture and tech stack
3. **Project Lead** approves architecture
4. **Structure Agent** sets up file/folder structure
5. **Documentation Agent** creates initial docs
6. **Developer Team** begins implementation

### During Development

1. **Developer Team** implements features
2. **Codebase Reviewer** reviews all PRs
3. **Security Agent** audits security-sensitive changes
4. **Documentation Agent** keeps docs updated
5. **Project Lead** monitors progress, unblocks issues

### Before Launch

1. **Security Agent** performs final security audit
2. **SEO & Marketing Agent** optimizes landing pages
3. **Codebase Reviewer** ensures quality standards met
4. **Documentation Agent** verifies docs are complete
5. **Project Lead** gives final sign-off

## Skill Contents

Each skill includes:

1. **SKILL.md** — Core definition with:
   - Philosophy and principles
   - Core responsibilities
   - Explicit boundaries (what NOT to do)
   - Role ownership matrix
   - Workflow guidance
   - Ambiguity handling
   - Skill identity

2. **references/** — Detailed guidance:
   - Checklists
   - Templates
   - Code examples
   - Best practices

### Reference Documents by Agent

| Agent | References |
|-------|------------|
| Project Lead | sprint-planning.md, communication-templates.md, decision-log.md |
| Senior Developer | architecture-patterns.md, tech-stack-template.md, task-template.md |
| Structure Agent | structure-templates.md, naming-conventions.md |
| Documentation Agent | doc-templates.md, api-docs-guide.md |
| Developer Team | code-style.md, testing-guide.md |
| Codebase Reviewer | review-checklist.md, common-issues.md |
| Security Agent | security-checklist.md, owasp-top-10.md |
| SEO & Marketing Agent | seo-checklist.md, copywriting-guide.md |
| Project Summarizer | quick-status-template.md, summary-examples.md |

## Customization

These skills are designed to be customized for your needs:

### Adding Project-Specific Context
Edit the SKILL.md files to add:
- Your tech stack preferences
- Company-specific conventions
- Project-specific requirements

### Adjusting Boundaries
If your team structure differs, adjust the ownership matrices accordingly.

### Adding New Agents
Use the same structure to create additional specialists:
- DevOps Agent
- QA Agent
- Data/Analytics Agent
- Design Agent

## Quick Reference

### When to Invoke Each Agent

| Situation | Agent |
|-----------|-------|
| Starting a project | Project Lead |
| Choosing technologies | Senior Developer |
| Setting up file structure | Structure Agent |
| Writing features | Developer Team |
| Reviewing code | Codebase Reviewer |
| Security concerns | Security Agent |
| Writing docs | Documentation Agent |
| Optimizing landing page | SEO & Marketing Agent |
| Creating project snapshot | Project Summarizer |
| Starting new conversation | Project Summarizer |
| Before major changes | Project Summarizer |

### Escalation Paths

| Issue | Escalate To |
|-------|-------------|
| Technical dispute in Dev Team | Senior Developer |
| Architecture disagreement | Project Lead |
| Security risk acceptance | Project Lead |
| Scope creep | Project Lead |
| Cross-agent conflict | Project Lead |

## License

These skills are provided for your use. Customize freely.

---

**Version:** 1.1  
**Last Updated:** January 2025  
**Skills Count:** 9 agents, 18 reference documents
