import { Hono } from 'hono';
import { cache } from 'hono/cache';

import { read as gcpRead, write as gcpWrite } from '../storages/gcp';
import { read as r2Read, write as r2Write } from '../storages/r2';
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
  .get('/artifacts/:id', async (c) => {
    switch (c.env.STORAGE) {
      case 'R2':
        return r2Read(c);
      case 'GCP':
        return gcpRead(c);
      default:
    }
  })
  .post('/artifacts/events', async ({ json }) => {
    return json({});
  })
  .put('/artifacts/:id', async (c) => {
    switch (c.env.STORAGE) {
      case 'R2':
        return r2Write(c);
      case 'GCP':
        return gcpWrite(c);
      default:
    }
  });
