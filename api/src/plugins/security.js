import fp from 'fastify-plugin';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';

function normalizeJwtPayload(payload = {}) {
  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role
  };
}

async function securityPlugin(app) {
  app.decorateRequest('authUser', null);
  app.decorateRequest('activityAction', null);
  app.decorateRequest('activityEmailAttempted', null);
  app.decorateRequest('activityRequestBody', null);
  app.decorateRequest('activityMetadata', null);
  app.decorateRequest('skipActivityLog', false);

  app.decorate('authenticate', async (request) => {
    try {
      await request.jwtVerify();
      request.authUser = normalizeJwtPayload(request.user);
    } catch (error) {
      throw new UnauthorizedError('Authentication required', {
        cause: error
      });
    }
  });

  app.decorate('authorize', (allowedRoles = []) => {
    return async (request) => {
      if (!request.authUser) {
        await app.authenticate(request);
      }

      if (
        Array.isArray(allowedRoles) &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(request.authUser?.role)
      ) {
        throw new ForbiddenError('You do not have permission to access this resource');
      }
    };
  });
}

export default fp(securityPlugin);
