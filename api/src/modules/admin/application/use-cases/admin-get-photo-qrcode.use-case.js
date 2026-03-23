import { PhotoNotFoundError } from '../../../photos/domain/errors/photo-not-found.error.js';

export class AdminGetPhotoQrCodeUseCase {
  constructor({ photoRepository }) {
    this.photoRepository = photoRepository;
  }

  async execute({ id }) {
    const photo = await this.photoRepository.findById(id);

    if (!photo) {
      throw new PhotoNotFoundError();
    }

    return {
      photoId: photo.id,
      qrCodeUrl: photo.qrCodeUrl,
      qrCodeValue: photo.qrCodeValue,
      downloadUrl: photo.downloadUrl,
      expiresAt: photo.metadata?.qr?.expiresAt || null,
      ttlSeconds: photo.metadata?.qr?.ttlSeconds || null
    };
  }
}
