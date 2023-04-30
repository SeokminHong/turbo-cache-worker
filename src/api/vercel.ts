import { Hono } from 'hono';

import type { Env } from '../types';
import { query } from '../utils/graphql';
import { auth } from '../middlewares/auth';

export const vercelApi = new Hono<Env>();

vercelApi
  .use('*', auth)
  .get('/user', async ({ json, req }) => {
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
  })
  .get('/teams', async ({ env, json }) => {
    return json({
      teams: [
        {
          createdAt: 0,
          created: '1900-01-01T00:00:00Z',
          id: env.ALLOWED_ORG,
          slug: env.ALLOWED_ORG,
          name: env.ALLOWED_ORG,
          membership: {
            role: 'MEMBER',
          },
        },
      ],
      pagination: {
        count: 1,
        next: null,
        prev: null,
      },
    });
  });
