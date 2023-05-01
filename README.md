# Turborepo Remote Cache

Turborepo Remote Cache's open source alternative.

It supports Cloudflare Workers and Node.js (WIP).

## Usage

1. Login and link
    ```sh
    # In a monorepo
    turbo login --login YOUR_DOMAIN --api YOUR_DOMAIN/api
    turbo link --login YOUR_DOMAIN --api YOUR_DOMAIN/api
    ```
2. Edit `.turbo/config.json`
    ```json
    {
      "apiurl": "YOUR_DOMAIN/api",
      "loginurl": "YOUR_DOMAIN",
      "teamslug": null,
      "teamid": "YOUR_ORG"
    }
    ```

## Development

### 1. Setup

```sh
pnpm install
cp .dev.vars.example .dev.vars
```

### 1. GitHub OAuth App
1. Create a GitHub OAuth app [link](https://github.com/settings/developers)
2. Set the redirection URL as `http://localhost:8787/turborepo/redirect`
3. Create a secret
4. Copy them to `.dev.vars`
    ```env
    GITHUB_CLIENT=YOUR_CLIENT
    GITHUB_CLIENT_SECRET=YOUR_CLIENT_SECRET
    ```
5. Set an organization to allow to access the cache
    ```env
    ALLOWED_ORG=YOUR_ORG
    ```

### 2-1. Using R2

1. Create buckets for Turbo
    ```sh
    wrangler r2 bucket create turbo-artifacts
    wrangler r2 bucket create preview-turbo-artifacts
    ```
2. Comment `GCP_TOKEN` on `wrangler.toml`
    ```diff
    - [[kv_namespaces]]
    - binding = "GCP_TOKEN"
    - id = "c26c953846004524851a7bca67b624e6"
    - preview_id = "b4ec6bc69c3e415289ec3d47fde77712"
    + # [[kv_namespaces]]
    + # binding = "GCP_TOKEN"
    + # id = "c26c953846004524851a7bca67b624e6"
    + # preview_id = "b4ec6bc69c3e415289ec3d47fde77712"
    ```

### 2-2. Using GCP

1. Create a bucket
2. Create a Google Service Account for the bucket and download it to a JSON file
3. Encode the account to Base64 string, then set `GOOGLE_SERVICE_ACCOUNT` of `.dev.vars`
    ```sh
    cat ./service-account.json | base64
    ```
4. Comment R2 config on `wrangler.toml`
    ```diff
    - [[r2_buckets]]
    - binding = "TURBO_ARTIFACTS"
    - bucket_name = "turbo-artifacts"
    - preview_bucket_name = "preview-turbo-artifacts"
    + # [[r2_buckets]]
    + # binding = "TURBO_ARTIFACTS"
    + # bucket_name = "turbo-artifacts"
    + # preview_bucket_name = "preview-turbo-artifacts"
    ```
5. Create KV namespaces for GCP tokens
    ```sh
    wrangler kv:namespace create GCP_TOKEN
    wrangler kv:namespace create GCP_TOKEN --preview
    ```
6. Replace `GCP_TOKEN`'s IDs on `wrangler.toml`
7. Set `BUCKET_NAME` on `.dev.vars`

## Deployment (Cloudflare Workers)

1. Do the above "development" steps
2. Run `wrangler publish`
3. Set variables and secrets

## Deployment (Node.js)

1. Do the above "development" steps via using GCP
2. Run `docker build . -t turbo-cache`
3. Run `docker run --env-file .dev.vars -it -p 8787:8787 turbo-cache`
