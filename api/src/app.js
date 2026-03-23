import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STATUS_CODES } from 'node:http';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { env } from './config/env.js';
import diPlugin from './plugins/di.js';
import securityPlugin from './plugins/security.js';
import observabilityPlugin from './plugins/observability.js';
import routesPlugin from './plugins/routes.js';
import { isAppError } from './errors/app-error.js';

function buildErrorResponse(error) {
  if (error?.code === 'FST_REQ_FILE_TOO_LARGE') {
    return {
      statusCode: 413,
      code: 'IMAGE_TOO_LARGE',
      message: 'A imagem excede o limite permitido para upload.'
    };
  }

  if (isAppError(error)) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.expose ? error.message : 'Internal Server Error',
      details: error.details
    };
  }

  if (error?.validation) {
    return {
      statusCode: 400,
      code: 'BAD_REQUEST',
      message: error.message || 'Payload invalido',
      details: error.validation
    };
  }

  const statusCode =
    Number.isInteger(error?.statusCode) && error.statusCode >= 400
      ? error.statusCode
      : 500;

  return {
    statusCode,
    code: error?.code || 'INTERNAL_SERVER_ERROR',
    message: statusCode >= 500 ? 'Internal Server Error' : error?.message,
    details: error?.details
  };
}

export async function buildApp(options = {}) {
  const app = Fastify({
    logger: options.logger ?? true
  });

  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const storageRoot = path.resolve(currentDir, '../storage');
  const assetsRoot = path.resolve(currentDir, './assets');

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET
  });

  await app.register(multipart, {
    limits: {
      files: 1,
      fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    }
  });

  await app.register(fastifyStatic, {
    root: storageRoot,
    prefix: `${env.STORAGE_PUBLIC_BASE_PATH}/`
  });

  await app.register(fastifyStatic, {
    root: assetsRoot,
    prefix: '/event-assets/',
    decorateReply: false
  });

  app.setErrorHandler((error, request, reply) => {
    const payload = buildErrorResponse(error);
    const logLevel = payload.statusCode >= 500 ? 'error' : 'warn';

    request.log[logLevel](
      {
        err: error,
        code: payload.code,
        statusCode: payload.statusCode
      },
      'Request failed'
    );

    return reply.status(payload.statusCode).send({
      statusCode: payload.statusCode,
      code: payload.code,
      error: STATUS_CODES[payload.statusCode] || 'Error',
      message: payload.message,
      ...(payload.details ? { details: payload.details } : {})
    });
  });

  await app.register(diPlugin, {
    diOverrides: options.diOverrides
  });
  await app.register(securityPlugin);
  await app.register(observabilityPlugin);
  await app.register(routesPlugin);

  return app;
}
