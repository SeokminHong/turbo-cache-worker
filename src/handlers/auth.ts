import { Hono } from 'hono';

import type { Env } from '../types';
import { query } from '../utils/graphql';
import { checkAuth } from '../utils/auth';

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
        `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${localRedirectUri}&scope=read:org,read:user`
      );
    })
    .get('/turborepo/redirect', async ({ req, env, redirect, text }) => {
      const code = req.query('code') || '';
      const redirectUri = req.cookie(REDIRECT_URL_KEY);
      const { access_token: token } = await fetch(
        `https://github.com/login/oauth/access_token?client_id=${env.GITHUB_CLIENT_ID}&client_secret=${env.GITHUB_CLIENT_SECRET}&code=${code}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'CF Worker',
          },
        }
      ).then((res) => res.json<TokenResponse>());
      const status = await checkAuth({ token, allowedOrg: env.ALLOWED_ORG });
      if (status !== 'OK') {
        return text('Unauthorized', 401);
      }

      return redirect(`${redirectUri}?token=${token}`);
    })
    .get('/turborepo/success', ({ html }) => {
      // Close the window
      return html(`<script> window.close() </script>`);
    });
}
