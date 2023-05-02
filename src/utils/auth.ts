import { Context } from 'hono';

import { query } from './graphql';
import { Env, env } from './env';

export async function checkAuth(c: Context<Env>, token?: string) {
  const tokenString = token ?? c.req.header('Authorization')?.split(' ')[1];
  if (!tokenString) {
    return 'Unauthorized';
  }
  const allowedOrg = env(c, 'ALLOWED_ORG');
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
    `Bearer ${tokenString}`
  );
  const orgs = data.viewer.organizations.nodes.map(({ login }) => login);
  if (!orgs.find((org) => org === allowedOrg)) {
    return 'Unauthorized';
  }
  return 'OK';
}
