import { UnauthorizedError } from '../../../../errors/app-error.js';

export class InvalidEmailLoginAttemptError extends UnauthorizedError {
  constructor() {
    super('Invalid credentials', {
      code: 'INVALID_LOGIN_EMAIL'
    });
  }
}
