import { UnauthorizedError } from '../../../../errors/app-error.js';

export class InvalidPasswordLoginAttemptError extends UnauthorizedError {
  constructor() {
    super('Invalid credentials', {
      code: 'INVALID_LOGIN_PASSWORD'
    });
  }
}
