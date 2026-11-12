import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  FRONTEND_ORIGINS: z.string().default('http://localhost:5173'),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON: z.string().optional(),
  FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH: z.string().optional(),
  FIREBASE_APP_CHECK_ENFORCED: z.enum(['true', 'false']).default('false'),
  CASHFREE_APP_ID: z.string().default(''),
  CASHFREE_SECRET_KEY: z.string().default(''),
  CASHFREE_ENV: z.enum(['sandbox', 'production']).default('sandbox'),
  DISCORD_ORDER_WEBHOOK_URL: z.string().default(''),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map(({ path, message }) => `${path.join('.')}: ${message}`);
  console.error(`Invalid server configuration:\n${problems.join('\n')}`);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  frontendOrigins: parsed.data.FRONTEND_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean),
};
