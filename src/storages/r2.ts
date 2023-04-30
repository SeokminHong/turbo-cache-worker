import type { Context } from 'hono';

import { Env, env } from '../utils/env';

export async function read(c: Context<Env>) {
  const id = c.req.param('id');
  const artifact = await env(c, 'TURBO_ARTIFACTS')
    ?.get(id)
    .then((r) => r?.arrayBuffer());
  if (!artifact) {
    return c.text('Not found', 404);
  }
  return c.body(artifact, 200, {
    'Content-Type': 'application/octet-stream',
  });
}

export async function write(c: Context<Env>) {
  const id = c.req.param('id');
  const body = c.req.body;
  env(c, 'TURBO_ARTIFACTS')?.put(id, body);
  return c.text('OK');
}
