import type { Hono } from 'hono';

import { checkAuth } from '../utils/auth';
import { Env, env } from '../utils/env';

const REDIRECT_URL_KEY = 'turbo-cache-redirect-uri';

type TokenResponse = {
  access_token: string;
  scope: string;
  token_type: string;
};

export function addAuthHandlers(app: Hono<Env>) {
  app
    .get('/turborepo/token', async (c) => {
      const redirectUri = c.req.query('redirect_uri') || '';
      c.cookie(REDIRECT_URL_KEY, redirectUri, {
        maxAge: 60 * 30,
        path: '/',
      });
      const url = new URL(c.req.url);
      const origin = url.origin;
      const localRedirectUri = `${origin}/turborepo/redirect`;
      const clientId = env(c, 'GITHUB_CLIENT_ID');
      return c.redirect(
        `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${localRedirectUri}&scope=read:org,read:user`
      );
    })
    .get('/turborepo/redirect', async (c) => {
      const code = c.req.query('code') || '';
      const redirectUri = c.req.cookie(REDIRECT_URL_KEY);
      const clientId = env(c, 'GITHUB_CLIENT_ID');
      const clientSecret = env(c, 'GITHUB_CLIENT_SECRET');
      const { access_token: token } = await fetch(
        `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'CF Worker',
          },
        }
      ).then((res) => res.json<TokenResponse>());
      const status = await checkAuth({
        token,
        allowedOrg: env(c, 'ALLOWED_ORG'),
      });
      if (status !== 'OK') {
        return c.text('Unauthorized', 401);
      }

      return c.redirect(`${redirectUri}?token=${token}`);
    })
    .get('/turborepo/success', ({ html }) => {
      // Close the window
      return html(`<script> window.close() </script>`);
    });
}
