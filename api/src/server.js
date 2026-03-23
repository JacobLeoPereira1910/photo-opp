import { buildApp } from './app.js';
import { env } from './config/env.js';

const start = async () => {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Server running on ${env.APP_BASE_URL}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
