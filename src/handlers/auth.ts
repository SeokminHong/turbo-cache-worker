import { Hono } from 'hono';

import type { Env } from '../types';
import { query } from '../utils/graphql';

const REDIRECT_URL_KEY = 'turbo-cache-redirect-uri';

type TokenResponse = {
  access_token: string;
  scope: string;
  token_type: string;
};

export function addAuthHandlers(app: Hono<Env>) {
  app
    .get('/turborepo/token', async ({ req, env, cookie, redirect }) => {
      const redirectUri = req.query('redirect_uri') || '';
      cookie(REDIRECT_URL_KEY, redirectUri, {
        maxAge: 60 * 30,
        path: '/',
      });
      const url = new URL(req.url);
      const origin = url.origin;
      const localRedirectUri = `${origin}/turborepo/redirect`;
      return redirect(
        `https://github.com/login/oauth/authorize?client_id=${env.CLIENT_ID}&redirect_uri=${localRedirectUri}&scope=read:org,read:user`
      );
    })
    .get(
      '/turborepo/redirect',
      async ({ req, env, redirect, status, text }) => {
        const code = req.query('code') || '';
        const redirectUri = req.cookie(REDIRECT_URL_KEY);
        const { access_token: token } = await fetch(
          `https://github.com/login/oauth/access_token?client_id=${env.CLIENT_ID}&client_secret=${env.CLIENT_SECRET}&code=${code}`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'User-Agent': 'CF Worker',
            },
          }
        ).then((res) => res.json<TokenResponse>());
        const { data } = await query<{
          viewer: {
            organizations: {
              nodes: { login: string }[];
            };
          };
        }>(
          /* GraphQL */ `
            query {
              viewer {
                organizations(first: 100) {
                  nodes {
                    login
                  }
                }
              }
            }
          `,
          `Bearer ${token}`
        );
        const orgs = data.viewer.organizations.nodes.map(({ login }) => login);
        console.log(
          orgs,
          env.ALLOWED_ORG,
          orgs.find((org) => org === env.ALLOWED_ORG)
        );
        if (!orgs.find((org) => org === env.ALLOWED_ORG)) {
          status(403);
          return text('Forbidden');
        }

        return redirect(`${redirectUri}?token=${token}`);
      }
    )
    .get('/turborepo/success', ({ html }) => {
      // Close the window
      return html(`<script> window.close() </script>`);
    });
}
