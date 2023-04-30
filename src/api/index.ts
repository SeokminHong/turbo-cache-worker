import { Hono } from 'hono';

import type { Env } from '../types';
import { query } from '../utils/graphql';

export const api = new Hono<Env>();

interface AuthUser {
  createdAt: number;
  resourceConfig: {};
  stagingPrefix: '';
  hasTrialAvailable: false;
  remoteCaching: {
    enabled: true;
  };
  id: string;
  email: string;
  username: string;
}

api.get('/user', async ({ json, req }) => {
  const { data } = await query<{
    viewer: {
      login: string;
      email: string;
    };
  }>(
    /* GraphQL */ `
      query {
        viewer {
          login
          email
        }
      }
    `,
    req.header('Authorization') || ''
  );
  return json({
    user: {
      remoteCaching: {
        enabled: true,
      },
      id: data.viewer.login,
      email: data.viewer.email,
      username: data.viewer.login,
    },
  });
});
