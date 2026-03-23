import fp from 'fastify-plugin';
import { authRoutes } from '../modules/auth/presentation/auth.routes.js';
import { activationRoutes } from '../modules/photos/presentation/activation.routes.js';
import { adminRoutes } from '../modules/admin/presentation/admin.routes.js';

async function routesPlugin(app) {
  app.get(
    '/health',
    {
      config: {
        skipActivityLog: true
      }
    },
    async () => ({
      status: 'ok'
    })
  );

  await app.register(authRoutes, { prefix: '/api/v1' });
  await app.register(activationRoutes, { prefix: '/api/v1' });
  await app.register(adminRoutes, { prefix: '/api/v1' });
}

export default fp(routesPlugin);
