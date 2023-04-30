import { Hono } from 'hono';

import { vercelApi } from './api/vercel';
import { artifactsApi } from './api/artifacts';
import { addAuthHandlers } from './handlers/auth';
import { get } from './storages/gcp';
import type { Env } from './types';

const app = new Hono<Env>();

app.get('/', (c) => c.text('Hello Hono!'));
addAuthHandlers(app);
app.get('/gcp', get);

app.route('/api/v2', vercelApi);
app.route('/api/v8', artifactsApi);

export default app;
