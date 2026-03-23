import { LogAction } from '../../logs/domain/enums/log-action.enum.js';

export async function authRoutes(app) {
  const authController = app.diContainer.resolve('authController');

  app.post('/auth/login', async (request, reply) => {
    return authController.login.call(authController, request, reply);
  });

  app.get(
    '/auth/me',
    {
      preHandler: [app.authenticate],
      config: {
        activityAction: LogAction.AUTH_ME
      }
    },
    async (request, reply) => {
      return authController.me.call(authController, request, reply);
    }
  );

  app.post('/auth/password-reset/request', async (request, reply) => {
    return authController.requestPasswordReset.call(authController, request, reply);
  });

  app.post('/auth/password-reset/verify-otp', async (request, reply) => {
    return authController.verifyOtp.call(authController, request, reply);
  });

  app.post('/auth/password-reset/confirm', async (request, reply) => {
    return authController.resetPassword.call(authController, request, reply);
  });
}
