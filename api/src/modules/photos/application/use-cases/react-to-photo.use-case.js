import { NotFoundError } from '../../../../errors/app-error.js';

export class ReactToPhotoUseCase {
  constructor({ photoRepository }) {
    this.photoRepository = photoRepository;
  }

  async execute({ id, photoId, reaction }) {
    const targetPhotoId = photoId || id;
    const photo = await this.photoRepository.findById(targetPhotoId);

    if (!photo) {
      throw new NotFoundError('Foto nao encontrada');
    }

    const updated = await this.photoRepository.updateById(targetPhotoId, { reaction });

    return { photo: updated };
  }
}
