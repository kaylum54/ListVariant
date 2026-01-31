# OWASP Top 10 Quick Reference

Quick reference for the most critical web application security risks.

## A01:2021 — Broken Access Control

**What it is:** Users can act outside their intended permissions.

**Common issues:**
- Missing authorization checks
- IDOR (Insecure Direct Object References)
- Bypassing access control via URL manipulation
- Privilege escalation
- CORS misconfiguration

**How to test:**
- Try accessing other users' resources
- Modify IDs in URLs/requests
- Test with different role levels
- Check API endpoints directly

**How to prevent:**
```typescript
// Always verify ownership
app.get('/api/documents/:id', async (req, res) => {
  const doc = await getDocument(req.params.id);
  
  // ✅ Check authorization
  if (!canAccess(req.user, doc)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  res.json(doc);
});
```

- Default deny
- Check authorization on every request
- Use server-side session for access control
- Disable directory listing
- Log access control failures

---

## A02:2021 — Cryptographic Failures

**What it is:** Failures related to cryptography that lead to sensitive data exposure.

**Common issues:**
- Sensitive data transmitted in cleartext
- Weak cryptographic algorithms (MD5, SHA1, DES)
- Hardcoded or weak encryption keys
- Missing encryption at rest
- Improper certificate validation

**How to test:**
- Check for HTTPS enforcement
- Review password hashing algorithms
- Look for hardcoded secrets
- Check data at rest encryption

**How to prevent:**
```typescript
// ✅ Use strong password hashing
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// ✅ Use strong encryption
import { createCipheriv, randomBytes } from 'crypto';
const key = randomBytes(32); // 256 bits
const iv = randomBytes(16);
const cipher = createCipheriv('aes-256-gcm', key, iv);
```

- Encrypt sensitive data at rest and in transit
- Use TLS 1.2+ for all connections
- Use strong, modern algorithms
- Manage keys securely
- Don't cache sensitive data

---

## A03:2021 — Injection

**What it is:** Untrusted data sent to an interpreter as part of a command or query.

**Common types:**
- SQL injection
- NoSQL injection
- Command injection
- LDAP injection
- XPath injection

**How to test:**
- Submit special characters: `' " ; -- /* */`
- Use automated scanners (SQLMap)
- Review code for string concatenation in queries

**How to prevent:**
```typescript
// ❌ Vulnerable to SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Parameterized query
const query = 'SELECT * FROM users WHERE email = $1';
await db.query(query, [email]);

// ✅ ORM with parameterization
const user = await User.findOne({ where: { email } });
```

- Use parameterized queries always
- Use ORMs safely
- Validate and sanitize input
- Escape special characters
- Use least privilege database accounts

---

## A04:2021 — Insecure Design

**What it is:** Flaws in design that can't be fixed by perfect implementation.

**Common issues:**
- Missing threat modeling
- No rate limiting on sensitive operations
- Business logic flaws
- Missing security requirements

**How to test:**
- Review threat models
- Test business logic abuse scenarios
- Check for missing controls

**How to prevent:**
- Establish secure design patterns
- Threat model early
- Use security requirements in user stories
- Reference architectures for security
- Unit and integration test security controls

---

## A05:2021 — Security Misconfiguration

**What it is:** Missing or incorrect security hardening.

**Common issues:**
- Default credentials
- Unnecessary features enabled
- Verbose error messages
- Missing security headers
- Outdated software

**How to test:**
- Check for default accounts
- Review server/framework configuration
- Check security headers
- Run configuration scanners

**How to prevent:**
```typescript
// ✅ Set security headers (Express/Helmet)
import helmet from 'helmet';
app.use(helmet());

// ✅ Custom CSP
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  }
}));
```

- Minimal platform (remove unused features)
- Automated hardening
- Regular configuration reviews
- Segmented architecture
- Security headers on all responses

---

## A06:2021 — Vulnerable and Outdated Components

**What it is:** Using components with known vulnerabilities.

**Common issues:**
- Outdated libraries
- Unmaintained dependencies
- Known CVEs not patched

**How to test:**
```bash
# npm
npm audit

# yarn
yarn audit

# Python
pip-audit

# Snyk (multi-language)
snyk test
```

**How to prevent:**
- Remove unused dependencies
- Inventory all components
- Monitor for vulnerabilities (automated)
- Only use trusted sources
- Regular update schedule

---

## A07:2021 — Identification and Authentication Failures

**What it is:** Weaknesses in authentication mechanisms.

**Common issues:**
- Weak passwords permitted
- Credential stuffing vulnerable
- Session fixation
- Weak session IDs
- Missing MFA

**How to test:**
- Test password requirements
- Test account lockout
- Analyze session tokens
- Test session management

**How to prevent:**
```typescript
// ✅ Strong session configuration
app.use(session({
  secret: process.env.SESSION_SECRET, // Strong, random
  name: 'sessionId', // Not default name
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  },
  resave: false,
  saveUninitialized: false,
  rolling: true
}));
```

- Implement MFA
- Rate limit authentication
- Use secure session management
- Implement account lockout
- Check for breached passwords

---

## A08:2021 — Software and Data Integrity Failures

**What it is:** Code and infrastructure without integrity verification.

**Common issues:**
- Unsigned updates
- Insecure CI/CD pipeline
- Insecure deserialization
- Unverified CDN resources

**How to test:**
- Review update mechanisms
- Check CI/CD security
- Review deserialization code
- Check SRI for CDN resources

**How to prevent:**
```html
<!-- ✅ Subresource Integrity -->
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-abc123..."
        crossorigin="anonymous"></script>
```

- Verify digital signatures
- Secure CI/CD pipeline
- Don't deserialize untrusted data
- Use SRI for external resources
- Review code and config changes

---

## A09:2021 — Security Logging and Monitoring Failures

**What it is:** Insufficient logging to detect and respond to attacks.

**Common issues:**
- Security events not logged
- Logs not monitored
- No alerting
- Logs only stored locally
- Sensitive data in logs

**How to test:**
- Review what's logged
- Check log storage and retention
- Verify alerting works

**How to prevent:**
```typescript
// ✅ Security event logging
function logSecurityEvent(event: {
  type: string;
  userId?: string;
  ip: string;
  details: object;
}) {
  logger.warn({
    ...event,
    timestamp: new Date().toISOString(),
    category: 'security'
  });
}

// Usage
logSecurityEvent({
  type: 'AUTH_FAILURE',
  userId: attemptedUser,
  ip: req.ip,
  details: { reason: 'invalid_password', attempts: failedAttempts }
});
```

- Log authentication events
- Log authorization failures
- Log input validation failures
- Centralize logs
- Implement alerting
- Establish incident response

---

## A10:2021 — Server-Side Request Forgery (SSRF)

**What it is:** Application fetches remote resources without validating user-supplied URLs.

**Common issues:**
- Unvalidated URL parameters
- Access to internal services
- Cloud metadata endpoints exposed
- Webhook URLs not validated

**How to test:**
- Try internal URLs (localhost, 127.0.0.1)
- Try cloud metadata URLs
- Try other internal services

**How to prevent:**
```typescript
// ✅ URL validation
function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Whitelist allowed hosts
    const allowed = ['api.example.com', 'cdn.example.com'];
    if (!allowed.includes(parsed.hostname)) {
      return false;
    }
    
    // Block internal addresses
    if (isInternalIp(parsed.hostname)) {
      return false;
    }
    
    // Require HTTPS
    if (parsed.protocol !== 'https:') {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
```

- Validate and sanitize URLs
- Use allowlists for remote resources
- Block requests to internal networks
- Disable unnecessary URL schemes
- Don't send raw responses to clients

---

## Quick Reference Card

| # | Risk | Key Prevention |
|---|------|----------------|
| A01 | Broken Access Control | Authorize every request |
| A02 | Cryptographic Failures | Use TLS, strong hashing |
| A03 | Injection | Parameterized queries |
| A04 | Insecure Design | Threat modeling |
| A05 | Security Misconfiguration | Hardening, minimal platform |
| A06 | Vulnerable Components | Dependency scanning |
| A07 | Auth Failures | MFA, strong sessions |
| A08 | Integrity Failures | Sign everything, secure CI/CD |
| A09 | Logging Failures | Log security events, alert |
| A10 | SSRF | Validate URLs, allowlist |
