import { z } from 'zod';

// ---------------------------------------------------------------------------
// 1. Schema — describes every env var the app needs
//    z.coerce.number() means: take the string "3000" and convert it to 3000
//    .default() means: use this value if the variable is not set at all
// ---------------------------------------------------------------------------
export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),

  // Application
  PORT: z.coerce
    .number({ error: 'PORT must be a number' })
    .int()
    .positive()
    .default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'], {
      error: 'NODE_ENV must be one of: development, production, test',
    })
    .default('development'),

  // Worker
  WORKER_ID: z.string().default(`worker-${process.pid}`),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),
  POLL_INTERVAL_MS: z.coerce.number().int().positive().default(1000),
});

export type EnvConfig = z.infer<typeof envSchema>;
