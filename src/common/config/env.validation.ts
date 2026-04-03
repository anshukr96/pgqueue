import { z } from 'zod';

export const envSchema = z.object({
  //Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  // Application
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Worker
  WORKER_ID: z.string().default(`worker-${process.pid}`),
  WORKER_CONCURRENCY: z.coerce.number().default(5),
  POLL_INTERVAL_MS: z.coerce.number().default(1000),
});

export type EnvConfig = z.infer<typeof envSchema>;
