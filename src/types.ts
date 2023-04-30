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
