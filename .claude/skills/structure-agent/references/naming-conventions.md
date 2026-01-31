# Naming Conventions

Comprehensive naming rules for files, folders, and code organization.

## Core Principle

**Consistency over preference.** Once a convention is established, follow it everywhere. Mixing conventions is worse than using a suboptimal convention consistently.

## Folder Naming

### Standard: kebab-case

All folders use `kebab-case` (lowercase with hyphens):

```
✅ Correct
/user-settings/
/data-table/
/auth-provider/

❌ Incorrect
/userSettings/      # camelCase
/UserSettings/      # PascalCase
/user_settings/     # snake_case
```

### Exceptions

| Folder | Convention | Reason |
|--------|------------|--------|
| React component folders (when containing single component) | `PascalCase` | Matches component name |
| `__tests__` | Leading underscores | Jest convention |
| `_private` | Leading underscore | Indicates internal use |

## File Naming

### By File Type

| File Type | Convention | Example |
|-----------|------------|---------|
| React components | `PascalCase.tsx` | `UserProfile.tsx` |
| React component folders | `PascalCase/index.tsx` | `UserProfile/index.tsx` |
| Hooks | `use[Name].ts` | `useAuth.ts`, `useLocalStorage.ts` |
| Utilities/helpers | `camelCase.ts` | `formatDate.ts`, `validateEmail.ts` |
| Constants | `camelCase.ts` | `config.ts`, `routes.ts` |
| Types/interfaces | `camelCase.types.ts` | `user.types.ts`, `api.types.ts` |
| API functions | `camelCase.api.ts` | `auth.api.ts`, `users.api.ts` |
| Services | `camelCase.service.ts` | `auth.service.ts` |
| Tests | `[filename].test.ts` | `UserProfile.test.tsx` |
| Test utilities | `camelCase.testUtils.ts` | `render.testUtils.ts` |
| Styles (CSS Modules) | `[ComponentName].module.css` | `UserProfile.module.css` |
| Styles (global) | `kebab-case.css` | `global-styles.css` |
| Server actions (Next.js) | `camelCase.actions.ts` | `auth.actions.ts` |
| Route handlers | `route.ts` | Next.js convention |
| Middleware | `camelCase.middleware.ts` | `auth.middleware.ts` |
| Database models | `camelCase.model.ts` | `user.model.ts` |
| Schemas (validation) | `camelCase.schema.ts` | `user.schema.ts` |

### File Suffixes

Use suffixes to indicate file purpose:

| Suffix | Purpose | Example |
|--------|---------|---------|
| `.test.ts` | Unit/integration tests | `auth.test.ts` |
| `.spec.ts` | Alternative test convention | `auth.spec.ts` |
| `.types.ts` | Type definitions | `user.types.ts` |
| `.api.ts` | API layer functions | `users.api.ts` |
| `.service.ts` | Business logic | `billing.service.ts` |
| `.repository.ts` | Data access | `users.repository.ts` |
| `.controller.ts` | Route handling | `users.controller.ts` |
| `.middleware.ts` | Middleware | `auth.middleware.ts` |
| `.model.ts` | Database model | `user.model.ts` |
| `.schema.ts` | Validation schema | `user.schema.ts` |
| `.actions.ts` | Server actions | `auth.actions.ts` |
| `.config.ts` | Configuration | `database.config.ts` |
| `.constants.ts` | Constants | `api.constants.ts` |
| `.utils.ts` | Utilities | `date.utils.ts` |
| `.mock.ts` | Mock data | `users.mock.ts` |
| `.fixture.ts` | Test fixtures | `users.fixture.ts` |
| `.d.ts` | Type declarations | `global.d.ts` |
| `.module.css` | CSS Modules | `Button.module.css` |

## Component Organization

### Single File Component

When a component is simple (< 150 lines, no subcomponents):

```
/components/
  Button.tsx
  Input.tsx
```

### Component Folder

When a component has related files:

```
/components/
  DataTable/
    DataTable.tsx           # Main component
    DataTable.test.tsx      # Tests
    DataTable.module.css    # Styles
    DataTableRow.tsx        # Subcomponent
    DataTableHeader.tsx     # Subcomponent
    index.ts                # Exports
```

### Index File Contents

```typescript
// DataTable/index.ts
export { DataTable } from './DataTable';
export type { DataTableProps } from './DataTable';
// Only export what consumers need
```

## Naming Rules

### Be Descriptive, Not Clever

```
✅ Good
getUserById.ts
formatCurrency.ts
validateEmailAddress.ts

❌ Bad
utils.ts           # Too vague
helpers.ts         # Too vague  
stuff.ts           # Meaningless
x.ts               # Cryptic
```

### Avoid Redundancy

```
✅ Good
/features/auth/login.ts
/components/Button.tsx

❌ Bad
/features/auth/authLogin.ts         # "auth" already in path
/components/ButtonComponent.tsx     # "Component" is redundant
```

### Use Full Words

```
✅ Good
/components/
/utilities/
/configuration/

❌ Bad (unless universally understood)
/comps/
/utils/            # Acceptable, widely understood
/config/           # Acceptable, widely understood
```

### Plural vs Singular

| Use Plural | Use Singular |
|------------|--------------|
| Folders containing multiple items: `/components/`, `/hooks/`, `/utils/` | Feature folders: `/auth/`, `/billing/` |
| Route folders: `/users/`, `/posts/` | Single-purpose folders: `/config/`, `/lib/` |

## Special Files

### Configuration Files (Root Level)

```
/
├── .env.example            # Environment template
├── .env.local              # Local overrides (gitignored)
├── .gitignore
├── .eslintrc.js            # Or eslint.config.js
├── .prettierrc
├── tsconfig.json
├── next.config.js          # Or .ts/.mjs
├── tailwind.config.js
├── package.json
└── README.md
```

### Documentation Files

```
/docs/
├── README.md               # Docs overview
├── CONTRIBUTING.md         # How to contribute
├── architecture/
│   ├── decisions.md        # ADRs
│   ├── file-structure.md   # This document
│   └── conventions.md      # Coding conventions
└── api/
    └── endpoints.md        # API documentation
```

## Refactoring Names

### When to Rename

- Convention violation
- Misleading name
- Scope changed significantly
- Merging similar concepts

### How to Rename Safely

1. **Search for all usages** — IDE find all references
2. **Update imports** — Let IDE help with refactoring
3. **Run tests** — Ensure nothing broke
4. **Update documentation** — Keep docs in sync
5. **Single PR** — Don't mix with feature work

## Anti-Patterns

### The "Utils" Junk Drawer

```
❌ Bad: Growing endlessly
/utils/
  helpers.ts        # What kind of helpers?
  functions.ts      # Could be anything
  misc.ts           # Definitely bad
  stuff.ts          # Worst
```

```
✅ Good: Specific and bounded
/utils/
  date.utils.ts     # Date formatting/parsing
  string.utils.ts   # String manipulation
  validation.utils.ts # Validation helpers
```

### Inconsistent Casing

```
❌ Bad: Mixed conventions
/components/
  Button.tsx
  inputField.tsx
  DATA_TABLE.tsx
```

### Overly Generic Names

```
❌ Bad
/components/
  Component.tsx
  Item.tsx
  Thing.tsx
  Wrapper.tsx      # Wrapper of what?
  Container.tsx    # Container of what?
```

### Deep Nesting with Redundant Names

```
❌ Bad
/features/billing/billing-invoices/invoice-list/InvoiceListItem.tsx

✅ Good
/features/billing/invoices/InvoiceListItem.tsx
```
