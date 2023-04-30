import { Context } from 'hono';

export type Env = {
  Bindings: {
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    ALLOWED_ORG: string;
    GOOGLE_SERVICE_ACCOUNT: string;
    BUCKET_NAME: string;
    STORAGE: 'R2' | 'GCP';

    TURBO_ARTIFACTS?: R2Bucket;
    GCP_TOKEN?: KVNamespace;
  };
};

export function env<K extends keyof Env['Bindings']>(
  c: Context<Env>,
  key: K
): Env['Bindings'][K] {
  return c.env?.[key] ?? (process.env[key] as Env['Bindings'][K]);
}
