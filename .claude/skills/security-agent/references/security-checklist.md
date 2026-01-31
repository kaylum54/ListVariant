# Security Checklist Expanded

Comprehensive security checklist for audits and reviews.

## Authentication

### Password Security

- [ ] Passwords hashed with bcrypt (cost factor ≥10) or Argon2
- [ ] No MD5, SHA1, or plain SHA256 for passwords
- [ ] Password minimum length ≥12 characters
- [ ] Password complexity requirements (or passphrase support)
- [ ] Common password dictionary check
- [ ] No password hints stored
- [ ] Password history enforced (prevent reuse)

### Session Management

- [ ] Session IDs are cryptographically random (≥128 bits entropy)
- [ ] Session IDs regenerated after login
- [ ] Session timeout implemented (idle and absolute)
- [ ] Secure session storage (not in URL, not in logs)
- [ ] Session invalidation on logout
- [ ] Concurrent session limits (if applicable)

### Token Security

- [ ] JWTs signed with strong algorithm (RS256 or ES256, not HS256 with weak secret)
- [ ] JWT expiration enforced
- [ ] Refresh token rotation implemented
- [ ] Token revocation mechanism exists
- [ ] No sensitive data in JWT payload
- [ ] Tokens stored securely (HttpOnly cookies or secure storage)

### Multi-Factor Authentication

- [ ] MFA available for sensitive operations
- [ ] MFA recovery mechanism secure
- [ ] MFA bypass tokens properly managed
- [ ] Rate limiting on MFA attempts

### Account Security

- [ ] Account lockout after failed attempts
- [ ] Lockout notification to user
- [ ] Secure account recovery flow
- [ ] Email verification for new accounts
- [ ] Account enumeration prevention

## Authorization

### Access Control

- [ ] Authorization checked on every request
- [ ] Default deny (whitelist, not blacklist)
- [ ] Principle of least privilege applied
- [ ] Role-based access control (RBAC) properly implemented
- [ ] Permission checks at the function level, not just route level

### Object-Level Authorization

- [ ] IDOR prevention (verify ownership before access)
- [ ] Horizontal privilege escalation prevented
- [ ] Vertical privilege escalation prevented
- [ ] Mass assignment vulnerabilities prevented

### API Authorization

- [ ] API keys properly scoped
- [ ] OAuth scopes enforced
- [ ] Rate limiting per user/API key
- [ ] API versioning doesn't bypass auth

## Input Validation

### General Input Handling

- [ ] All input validated server-side (never trust client)
- [ ] Whitelist validation preferred over blacklist
- [ ] Input length limits enforced
- [ ] Input type validation (numbers, emails, etc.)
- [ ] Canonicalization before validation

### SQL Injection Prevention

- [ ] Parameterized queries used everywhere
- [ ] No string concatenation in queries
- [ ] Stored procedures with parameterized inputs
- [ ] ORM used safely (no raw query injection)
- [ ] Database user has minimal privileges

### XSS Prevention

- [ ] Output encoding for HTML context
- [ ] Output encoding for JavaScript context
- [ ] Output encoding for URL context
- [ ] Output encoding for CSS context
- [ ] Content Security Policy (CSP) implemented
- [ ] X-XSS-Protection header set
- [ ] HTMLsanitizer used for rich text

### Command Injection Prevention

- [ ] Avoid system commands when possible
- [ ] Use safe APIs (execFile vs exec)
- [ ] Input validation for any command parameters
- [ ] No shell interpolation of user input

### Path Traversal Prevention

- [ ] File paths validated against whitelist
- [ ] No user input in file paths (or strictly validated)
- [ ] Chroot or sandbox for file operations
- [ ] Symlink attacks prevented

### Other Injection Types

- [ ] XML External Entity (XXE) disabled
- [ ] JSON injection prevented
- [ ] LDAP injection prevented
- [ ] Template injection prevented
- [ ] Header injection prevented

## Data Protection

### Encryption at Rest

- [ ] Sensitive data encrypted in database
- [ ] Encryption keys properly managed
- [ ] Key rotation mechanism exists
- [ ] Backups encrypted

### Encryption in Transit

- [ ] TLS 1.2+ enforced
- [ ] HSTS header configured
- [ ] Certificate properly configured
- [ ] No mixed content
- [ ] Secure cipher suites only

### Sensitive Data Handling

- [ ] PII identified and documented
- [ ] PII minimization (collect only what's needed)
- [ ] PII retention limits enforced
- [ ] PII access logged
- [ ] Right to deletion implemented (if required)
- [ ] Data anonymization for non-production

### Secrets Management

- [ ] No hardcoded secrets in code
- [ ] Secrets in environment variables or secret manager
- [ ] Secrets not logged
- [ ] Secrets not in version control
- [ ] Secret rotation mechanism exists

## Error Handling & Logging

### Error Handling

- [ ] Generic error messages to users
- [ ] Detailed errors only in logs (not responses)
- [ ] Stack traces not exposed
- [ ] No sensitive data in error messages
- [ ] Consistent error format

### Security Logging

- [ ] Authentication events logged
- [ ] Authorization failures logged
- [ ] Input validation failures logged
- [ ] Security-relevant events timestamped
- [ ] Logs protected from tampering
- [ ] Log injection prevented
- [ ] No sensitive data in logs

### Monitoring & Alerting

- [ ] Security events monitored
- [ ] Alert thresholds configured
- [ ] Incident response process defined
- [ ] Log retention policy in place

## HTTP Security

### Security Headers

- [ ] Content-Security-Policy (CSP)
- [ ] Strict-Transport-Security (HSTS)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY (or SAMEORIGIN)
- [ ] Referrer-Policy
- [ ] Permissions-Policy

### Cookie Security

- [ ] HttpOnly flag on session cookies
- [ ] Secure flag on all cookies (HTTPS only)
- [ ] SameSite attribute set (Strict or Lax)
- [ ] Cookie scope minimized (path, domain)

### CORS Configuration

- [ ] CORS whitelist (not wildcard in production)
- [ ] Credentials mode properly configured
- [ ] Preflight caching appropriate
- [ ] No sensitive data in CORS-accessible endpoints without auth

### CSRF Protection

- [ ] CSRF tokens for state-changing requests
- [ ] SameSite cookies as defense in depth
- [ ] Origin/Referer validation
- [ ] Custom headers for APIs

## File Handling

### File Upload Security

- [ ] File type validation (magic bytes, not just extension)
- [ ] File size limits enforced
- [ ] Filename sanitization
- [ ] Files stored outside web root
- [ ] No execution permissions on upload directory
- [ ] Malware scanning (if applicable)
- [ ] Content-Type set correctly on download

### File Download Security

- [ ] Authorization checked before download
- [ ] Path traversal prevented
- [ ] Content-Disposition header set
- [ ] No sensitive files accessible

## Third-Party Dependencies

### Dependency Management

- [ ] Dependencies from trusted sources
- [ ] Lock files committed
- [ ] No vulnerable dependencies (npm audit, etc.)
- [ ] Automated vulnerability scanning in CI
- [ ] Regular dependency updates scheduled
- [ ] Unused dependencies removed

### Third-Party Services

- [ ] API keys properly scoped
- [ ] Webhooks validated (signatures)
- [ ] Data sharing minimized
- [ ] Third-party security reviewed

## Infrastructure

### Environment Security

- [ ] Debug mode disabled in production
- [ ] Development endpoints removed/blocked
- [ ] Admin interfaces protected
- [ ] Unnecessary services disabled
- [ ] Ports minimized

### Deployment Security

- [ ] Infrastructure as code reviewed
- [ ] Deployment secrets secured
- [ ] Rollback mechanism exists
- [ ] Blue-green or canary deployment
- [ ] Immutable infrastructure (if applicable)

## API-Specific

### API Security

- [ ] Authentication required (except public endpoints)
- [ ] Authorization per endpoint
- [ ] Rate limiting implemented
- [ ] Input validation on all parameters
- [ ] Output filtering (no over-exposure)
- [ ] Pagination enforced
- [ ] Request size limits

### GraphQL-Specific

- [ ] Query depth limiting
- [ ] Query complexity analysis
- [ ] Introspection disabled in production
- [ ] Field-level authorization

### WebSocket-Specific

- [ ] Authentication on connection
- [ ] Authorization per message type
- [ ] Message size limits
- [ ] Connection limits

## Mobile/Client-Specific

### Mobile Security

- [ ] Certificate pinning (if applicable)
- [ ] Secure storage for tokens
- [ ] No sensitive data in logs
- [ ] Obfuscation applied
- [ ] Root/jailbreak detection (if required)

### Browser Storage

- [ ] No sensitive data in localStorage
- [ ] SessionStorage for temporary data
- [ ] IndexedDB encrypted (if sensitive)
- [ ] Clear storage on logout

## Compliance Considerations

Depending on requirements:

- [ ] GDPR compliance (EU data)
- [ ] CCPA compliance (California data)
- [ ] HIPAA compliance (health data)
- [ ] PCI-DSS compliance (payment data)
- [ ] SOC 2 controls (if applicable)

## Audit Trail

- [ ] Checklist completion documented
- [ ] Findings logged
- [ ] Exceptions justified and approved
- [ ] Re-audit scheduled
