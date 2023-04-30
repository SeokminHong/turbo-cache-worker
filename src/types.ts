export type Env = {
  Bindings: {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    ALLOWED_ORG: string;
    TURBO_ARTIFACTS?: R2Bucket;
  };
};
