import type { MiddlewareHandler } from 'hono';

import { Env } from '../types';
import { checkAuth } from '../utils/auth';

export const auth: MiddlewareHandler<Env> = async (c, next) => {
  const authHeader = c.req.header('Authorization') || '';
  const status = await checkAuth({ authHeader, allowedOrg: c.env.ALLOWED_ORG });
  if (status !== 'OK') {
    return c.text('Unauthorized', 401);
  }
  await next();
};
