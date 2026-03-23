import { BadRequestError } from '../../../../errors/app-error.js';

export class InvalidOtpError extends BadRequestError {
  constructor() {
    super('Codigo incorreto', {
      code: 'INVALID_OTP'
    });
  }
}
