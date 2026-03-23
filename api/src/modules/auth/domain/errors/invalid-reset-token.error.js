import { BadRequestError } from '../../../../errors/app-error.js';

export class InvalidResetTokenError extends BadRequestError {
  constructor() {
    super('Token de redefinicao invalido ou expirado', {
      code: 'INVALID_RESET_TOKEN'
    });
  }
}
