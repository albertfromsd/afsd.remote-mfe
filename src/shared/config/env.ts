/**
 * Runtime env validation for the remote template.
 *
 * Build-time env vars are inlined into the bundle by rsbuild (`loadEnv` in
 * `rsbuild.config.ts`). This module reads them via `process.env` at runtime,
 * validates with zod, and exposes a typed `env` object. Failure throws at
 * import — fail-fast over silent miswiring.
 *
 * The remote consumes the host's URL but doesn't expose its own to anyone;
 * `PUBLIC_REMOTE_TEMPLATE_URL` is not in this schema.
 *
 * Add a var: define the zod schema below AND ensure its prefix is in
 * `ENV.PUBLIC_PREFIXES` (app.constants.ts) so rsbuild inlines it.
 */
import { z } from 'zod';
import { ENV } from './app.constants';

const envSchema = z.object({
  PUBLIC_HOST_TEMPLATE_URL: z.string().url().default(ENV.DEFAULT_HOST_URL),
  PUBLIC_API_BASE_URL: z.string().url().optional(),
  /** 'debug' | 'info' | 'warn' | 'error'. Defaults to 'info' in prod, 'debug' in dev. */
  PUBLIC_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;
let overrides: Partial<Env> = {};

function parseEnv(): Env {
  const raw = {
    PUBLIC_HOST_TEMPLATE_URL: process.env.PUBLIC_HOST_TEMPLATE_URL,
    PUBLIC_API_BASE_URL: process.env.PUBLIC_API_BASE_URL,
    PUBLIC_LOG_LEVEL: process.env.PUBLIC_LOG_LEVEL,
  };
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return { ...result.data, ...overrides };
}

export const env = new Proxy({} as Env, {
  get(_t, key: keyof Env) {
    cached ??= parseEnv();
    return cached[key];
  },
});

export function setEnvOverrides(partial: Partial<Env>): void {
  overrides = { ...overrides, ...partial };
  cached = parseEnv();
}

export function resetEnvCache(): void {
  cached = null;
  overrides = {};
}
