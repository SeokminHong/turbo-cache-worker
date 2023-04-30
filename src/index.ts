import { Hono } from 'hono';

import { vercelApi } from './api/vercel';
import { artifactsApi } from './api/artifacts';
import { addAuthHandlers } from './handlers/auth';
import type { Env } from './types';

const app = new Hono<Env>();

app.get('/', (c) => c.text('Hello Hono!'));
addAuthHandlers(app);
app.get('/test', async (c) => {
  console.log(c.env.STORAGE);
});

app.route('/api/v2', vercelApi);
app.route('/api/v8', artifactsApi);

export default app;
