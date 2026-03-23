import { ForbiddenError } from '../../../../errors/app-error.js';
import { UserRole } from '../../../users/domain/enums/user-role.enum.js';
import { PhotoNotFoundError } from '../../domain/errors/photo-not-found.error.js';

function assertPhotoAccess(photo, requester) {
  if (!requester) {
    return;
  }

  if (
    requester.role !== UserRole.ADMIN &&
    photo.promoterId !== requester.id
  ) {
    throw new ForbiddenError('You do not have permission to access this photo');
  }
}

export class GetPhotoQrCodeUseCase {
  constructor({ photoRepository }) {
    this.photoRepository = photoRepository;
  }

  async execute({ id, requester }) {
    const photo = await this.photoRepository.findById(id);

    if (!photo) {
      throw new PhotoNotFoundError();
    }

    assertPhotoAccess(photo, requester);

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
