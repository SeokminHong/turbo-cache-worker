import { serve } from '@hono/node-server';

import app from '.';

const server = serve(
  { fetch: app.fetch, port: Number(process.env.PORT ?? 8787) },
  ({ address, port }) => {
    console.log(`Server listening on ${address}:${port}`);
  }
);

const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

Object.entries(signals).forEach(([signal, value]) => {
  process.on(signal, () => {
    console.log(`Received ${signal}, stopping server...`);
    server.close(() => {
      console.log(`server stopped by ${signal} with value ${value}`);
      process.exit(0);
    });
  });
});
