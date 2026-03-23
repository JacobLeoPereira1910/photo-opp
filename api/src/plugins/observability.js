import fp from 'fastify-plugin';
import { sanitizeLogPayload } from '../shared/utils/sanitize-log-payload.js';

function getRoutePath(request) {
  return request.routeOptions?.url || request.url.split('?')[0];
}

function getAction(request) {
  return (
    request.activityAction ||
    request.routeOptions?.config?.activityAction ||
    'http.request'
  );
}

async function observabilityPlugin(app) {
  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });

  app.addHook('preHandler', async (request) => {
    const contentType = request.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');

    if (!isMultipart && request.body !== undefined) {
      request.activityRequestBody = sanitizeLogPayload(request.body);
    }
  });

  app.addHook('onResponse', async (request, reply) => {
    if (request.skipActivityLog || request.routeOptions?.config?.skipActivityLog) {
      return;
    }

    try {
      const activityLoggerService = app.diContainer.resolve('activityLoggerService');

      await activityLoggerService.logHttpRequest({
        requestId: request.id,
        userId: request.authUser?.id || null,
        emailAttempted:
          request.activityEmailAttempted ||
          request.activityRequestBody?.email ||
          null,
        action: getAction(request),
        method: request.method,
        route: getRoutePath(request),
        ip: request.ip,
        requestBody: request.activityRequestBody,
        responseStatus: reply.statusCode,
        metadata: sanitizeLogPayload({
          params: request.params,
          query: request.query,
          userAgent: request.headers['user-agent'] || null
        })
      });
    } catch (error) {
      request.log.error({ err: error }, 'Failed to persist activity log');
    }
  });
}

export default fp(observabilityPlugin);
