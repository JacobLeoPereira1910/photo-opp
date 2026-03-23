import { LogAction } from '../../logs/domain/enums/log-action.enum.js';
import { parseSchema } from '../../../shared/utils/parse-schema.js';
import {
  loginSchema,
  requestPasswordResetSchema,
  verifyOtpSchema,
  resetPasswordSchema
} from './auth.schemas.js';

export class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }

  async login(request, reply) {
    const input = parseSchema(loginSchema, request.body || {});
    request.activityEmailAttempted = input.email;

    try {
      const result = await this.authService.login(input);
      request.activityAction = LogAction.AUTH_LOGIN_SUCCESS;
      return reply.status(200).send(result);
    } catch (error) {
      if (error?.code === 'INVALID_LOGIN_EMAIL') {
        request.activityAction = LogAction.AUTH_LOGIN_INVALID_EMAIL;
      }

      if (error?.code === 'INVALID_LOGIN_PASSWORD') {
        request.activityAction = LogAction.AUTH_LOGIN_INVALID_PASSWORD;
      }

      throw error;
    }
  }

  async me(request, reply) {
    const result = await this.authService.getMe({
      userId: request.authUser.id
    });

    return reply.status(200).send(result);
  }

  async requestPasswordReset(request, reply) {
    const input = parseSchema(requestPasswordResetSchema, request.body || {});
    const result = await this.authService.requestPasswordReset(input);
    return reply.status(200).send(result);
  }

  async verifyOtp(request, reply) {
    const input = parseSchema(verifyOtpSchema, request.body || {});
    const result = await this.authService.verifyOtp(input);
    return reply.status(200).send(result);
  }

  async resetPassword(request, reply) {
    const input = parseSchema(resetPasswordSchema, request.body || {});
    const result = await this.authService.resetPassword(input);
    return reply.status(200).send(result);
  }
}
