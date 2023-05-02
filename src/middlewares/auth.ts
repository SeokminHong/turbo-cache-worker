import type { MiddlewareHandler } from 'hono';

import { checkAuth } from '../utils/auth';
import type { Env } from '../utils/env';

export const auth: MiddlewareHandler<Env> = async (c, next) => {
  const status = await checkAuth(c);
  if (status !== 'OK') {
    return c.text('Unauthorized', 401);
  }
  await next();
};
