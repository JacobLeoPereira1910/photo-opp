import { BadRequestError } from '../../../../errors/app-error.js';

export class OtpExpiredError extends BadRequestError {
  constructor() {
    super('Codigo expirado ou invalido', {
      code: 'OTP_EXPIRED'
    });
  }
}
