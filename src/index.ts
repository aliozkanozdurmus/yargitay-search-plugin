import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';
import { prettyJSON } from 'hono/pretty-json';

import { gateway } from './routes/gateway';
import { yargitaySearch } from './routes/yargitay-search';

export type Bindings = {
  development: boolean;
};

export const app = new Hono<{ Bindings: Bindings }>({
  strict: false,
})
  .use(
    prettyJSON(),
    logger(),
    cors({
  origin: '*',
      credentials: true,
      allowHeaders: [
        'X-CSRF-Token',
        'X-Requested-With',
        'Accept',
        'Accept-Version',
        'Content-Length',
        'Content-MD5',
        'Content-Type',
        'Date',
        'X-Api-Version',
        'x-lobe-trace',
        'x-lobe-plugin-settings',
        'x-lobe-chat-auth',
      ],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
    serveStatic({ root: './public' })
  )
  .get('/', (c) =>
    c.text(
      'Welcome to Yargitay Search Plugin!, A plugin for LobeChat to search Yargitay decisions.',
    ),
  )
  .basePath('/api')
  .get('/', (c) =>
    c.json({
      message: 'Welcome to Yargitay Search Plugin!',
      description: 'A plugin for LobeChat to search Yargitay decisions.',
      routes: [
        {
          path: '/gateway',
          method: 'POST',
          description: 'Gateway for the plugin.',
        },
        {
          path: '/yargitay-search',
          method: 'POST',
          description: 'Search Yargitay decisions.',
        },
      ],
    }),
  )
  .route('/gateway', gateway)
  .route('/yargitay-search', yargitaySearch);

export default {
  port: 3000,
  fetch: app.fetch,
}; 