import { envSchema, EnvConfig } from './env.validation';

// validate() is the function ConfigModule calls at startup.
// It receives the raw process.env object (all values are strings).
// We parse it through Zod and either return the validated config
// or crash with a human-readable error listing every failed variable.
export function validate(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (result.success) {
    return result.data;
  }

  const formatted = result.error.issues
    .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  console.error('\n❌ Invalid environment variables:\n');
  console.error(formatted);
  console.error('\nFix the above variables in your .env file and restart.\n');

  process.exit(1);
}
