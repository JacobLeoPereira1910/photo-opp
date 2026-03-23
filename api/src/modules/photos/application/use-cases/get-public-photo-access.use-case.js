import { PhotoStatus } from '../../domain/enums/photo-status.enum.js';

function parseExpiry(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export class GetPublicPhotoAccessUseCase {
  constructor({ activeEventConfig, photoRepository }) {
    this.activeEventConfig = activeEventConfig;
    this.photoRepository = photoRepository;
  }

  async execute({ id }) {
    const photo = await this.photoRepository.findById(id);

    if (!photo) {
      return {
        status: 'not-found',
        photo: null,
        event: {
          name: this.activeEventConfig.name
        }
      };
    }

    const qrExpiresAt = parseExpiry(photo.metadata?.qr?.expiresAt);
    const isExpired = qrExpiresAt ? qrExpiresAt.getTime() < Date.now() : false;

    if (photo.status !== PhotoStatus.READY) {
      return {
        status: 'processing',
        photo,
        event: {
          name: photo.metadata?.event?.name || this.activeEventConfig.name
        },
        expiresAt: qrExpiresAt?.toISOString() || null
      };
    }

    if (isExpired) {
      return {
        status: 'expired',
        photo,
        event: {
          name: photo.metadata?.event?.name || this.activeEventConfig.name
        },
        expiresAt: qrExpiresAt?.toISOString() || null
      };
    }

    return {
      status: 'ready',
      photo,
      event: {
        name: photo.metadata?.event?.name || this.activeEventConfig.name
      },
      expiresAt: qrExpiresAt?.toISOString() || null
    };
  }
}
