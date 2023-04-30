import { query } from './graphql';

type Arg = (
  | {
      token: string;
      authHeader?: never;
    }
  | {
      authHeader: string;
      token?: never;
    }
) & {
  allowedOrg: string;
};

export async function checkAuth({ token, authHeader, allowedOrg }: Arg) {
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
    authHeader || `Bearer ${token}`
  );
  const orgs = data.viewer.organizations.nodes.map(({ login }) => login);
  if (!orgs.find((org) => org === allowedOrg)) {
    return 'Unauthorized';
  }
  return 'OK';
}
