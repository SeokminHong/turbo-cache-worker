import { Context } from 'hono';

import { Env } from '../types';

export async function read({ req, env, text, body }: Context<Env>) {
  const id = req.param('id');
  const artifact = await env.TURBO_ARTIFACTS?.get(id).then((r) =>
    r?.arrayBuffer()
  );
  if (!artifact) {
    return text('Not found', 404);
  }
  return body(artifact, 200, {
    'Content-Type': 'application/octet-stream',
  });
}

export async function write({ req, env, text }: Context<Env>) {
  const id = req.param('id');
  const body = req.body;
  env.TURBO_ARTIFACTS?.put(id, body);
  return text('OK');
}
