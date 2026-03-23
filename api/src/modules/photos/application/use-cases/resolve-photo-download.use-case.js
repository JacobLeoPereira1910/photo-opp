import { AppError, BusinessRuleError, NotFoundError } from '../../../../errors/app-error.js';
import { PhotoStatus } from '../../domain/enums/photo-status.enum.js';
import { PhotoNotFoundError } from '../../domain/errors/photo-not-found.error.js';

function parseExpiry(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export class ResolvePhotoDownloadUseCase {
  constructor({ photoRepository, storageProvider }) {
    this.photoRepository = photoRepository;
    this.storageProvider = storageProvider;
  }

  async execute({ id }) {
    const photo = await this.photoRepository.findById(id);

    if (!photo) {
      throw new PhotoNotFoundError();
    }

    if (photo.status !== PhotoStatus.READY) {
      throw new BusinessRuleError('Photo is not available for download yet', {
        code: 'PHOTO_NOT_READY'
      });
    }

    const qrExpiresAt = parseExpiry(photo.metadata?.qr?.expiresAt);

    if (qrExpiresAt && qrExpiresAt.getTime() < Date.now()) {
      throw new AppError('QR Code expirado. Gere uma nova entrega para continuar.', {
        code: 'PHOTO_DOWNLOAD_EXPIRED',
        statusCode: 410
      });
    }

    const framedPath = photo.metadata?.storage?.framedPath;

    if (!framedPath) {
      throw new NotFoundError('Processed photo file not found', {
        code: 'PHOTO_FILE_NOT_FOUND'
      });
    }

    return {
      fileName: `${photo.id}.png`,
      contentType: photo.metadata?.outputContentType || 'image/png',
      stream: this.storageProvider.createReadStream(framedPath)
    };
  }
}
