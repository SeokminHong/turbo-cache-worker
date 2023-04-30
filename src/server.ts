import { serve } from '@hono/node-server';

import app from '.';

serve({ ...app, port: 8787 });
