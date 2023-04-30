import { Hono } from 'hono';

import { api } from './api/vercel';
import { addAuthHandlers } from './handlers/auth';
import type { Env } from './types';

const app = new Hono<Env>();

app.get('/', (c) => c.text('Hello Hono!'));
addAuthHandlers(app);

app.route('/api/v2', api);

export default app;
