import { toPhotoOutput } from '../../../../shared/mappers/photo.mapper.js';
import { PhotoNotFoundError } from '../../../photos/domain/errors/photo-not-found.error.js';

export class AdminGetPhotoUseCase {
  constructor({ photoRepository }) {
    this.photoRepository = photoRepository;
  }

  async execute({ id }) {
    const photo = await this.photoRepository.findById(id);

    if (!photo) {
      throw new PhotoNotFoundError();
    }

    return {
      photo: toPhotoOutput(photo)
    };
  }
}
