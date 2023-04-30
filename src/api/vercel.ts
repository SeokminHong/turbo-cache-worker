import { Hono } from 'hono';

import { auth } from '../middlewares/auth';
import { Env, env } from '../utils/env';
import { query } from '../utils/graphql';

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
  .get('/teams', async (c) => {
    const allowedOrg = env(c, 'ALLOWED_ORG');
    return c.json({
      teams: [
        {
          createdAt: 0,
          created: '1900-01-01T00:00:00Z',
          id: allowedOrg,
          slug: allowedOrg,
          name: allowedOrg,
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
