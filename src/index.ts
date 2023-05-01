import { Hono } from 'hono';
import { logger } from 'hono/logger';

import { vercelApi } from './api/vercel';
import { artifactsApi } from './api/artifacts';
import { addAuthHandlers } from './handlers/auth';
import type { Env } from './utils/env';

const app = new Hono<Env>();

app.use('*', logger());

app.get('/', (c) => c.text('Hello Hono!'));
addAuthHandlers(app);

app.route('/api/v2', vercelApi);
app.route('/api/v8', artifactsApi);

export default app;
