import { Hono } from 'hono';
import { cache } from 'hono/cache';

import type { Env } from '../types';

export const artifactsApi = new Hono<Env>();

artifactsApi
  .get('/artifacts/status', async ({ json }) => {
    return json({
      status: 'enabled',
    });
  })
  .get(
    '/artifacts/:id',
    cache({
      cacheName: 'artifacts',
    })
  )
  .get('/artifacts/:id', async ({ env, req, text, body }) => {
    const id = req.param('id');
    console.log(req.query('teamId'), req.query('slug'));
    const artifact = await env.TURBO_ARTIFACTS?.get(id).then((r) =>
      r?.arrayBuffer()
    );
    if (!artifact) {
      return text('Not found', 404);
    }
    return body(artifact, 200, {
      'Content-Type': 'application/octet-stream',
    });
  })
  .post('/artifacts/events', async ({ req, json }) => {
    return json({});
  })
  .put('/artifacts/:id', async ({ env, req }) => {
    const id = req.param('id');
    const body = req.body;
    env.TURBO_ARTIFACTS?.put(id, body);
  });
