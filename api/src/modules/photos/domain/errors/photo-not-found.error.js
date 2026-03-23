import { NotFoundError } from '../../../../errors/app-error.js';

export class PhotoNotFoundError extends NotFoundError {
  constructor() {
    super('Photo not found', {
      code: 'PHOTO_NOT_FOUND'
    });
  }
}
