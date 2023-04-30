import type { MiddlewareHandler } from 'hono';

import { checkAuth } from '../utils/auth';
import { Env, env } from '../utils/env';

export const auth: MiddlewareHandler<Env> = async (c, next) => {
  const authHeader = c.req.header('Authorization') || '';
  const status = await checkAuth({
    authHeader,
    allowedOrg: env(c, 'ALLOWED_ORG'),
  });
  if (status !== 'OK') {
    return c.text('Unauthorized', 401);
  }
  await next();
};
