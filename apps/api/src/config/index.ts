import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const WEAK_SECRET_PATTERNS = [
  'your-super-secret',
  'change-in-production',
  'secret',
  'password',
  'changeme',
  'default',
  'example',
  'test',
];

function requireSecretEnv(name: string): string {
  const value = requireEnv(name);

  const isProduction = process.env.NODE_ENV === 'production';
  const isWeak =
    value.length < 32 ||
    WEAK_SECRET_PATTERNS.some((pattern) => value.toLowerCase().includes(pattern));

  if (isProduction && isWeak) {
    throw new Error(
      `SECURITY: ${name} is too weak for production. ` +
        `Use a cryptographically random string of at least 32 characters. ` +
        `Generate one with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
    );
  }

  if (isWeak) {
    console.warn(
      `[SECURITY WARNING] ${name} appears to use a weak/template value. ` +
        `This is acceptable for local development but MUST be changed before deploying to production.`
    );
  }

  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  jwtSecret: requireSecretEnv('JWT_SECRET'),
  jwtRefreshSecret: requireSecretEnv('JWT_REFRESH_SECRET'),
  ebay: {
    clientId: process.env.EBAY_CLIENT_ID || '',
    clientSecret: process.env.EBAY_CLIENT_SECRET || '',
    redirectUri: process.env.EBAY_REDIRECT_URI || '',
    apiUrl: process.env.EBAY_API_URL || 'https://api.ebay.com',
  },
  etsy: {
    clientId: process.env.ETSY_CLIENT_ID || '',
    clientSecret: process.env.ETSY_CLIENT_SECRET || '',
    redirectUri: process.env.ETSY_REDIRECT_URI || 'http://localhost:4000/api/connections/etsy/callback',
  },
  platforms: {
    vinted: { enabled: true },
    depop: { enabled: true },
    poshmark: { enabled: true },
  },
};
