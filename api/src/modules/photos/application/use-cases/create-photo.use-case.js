import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { PhotoStatus } from '../../domain/enums/photo-status.enum.js';
import { toPhotoOutput } from '../../../../shared/mappers/photo.mapper.js';
import { buildPublicUrl } from '../../../../shared/utils/build-public-url.js';
import {
  getExtensionForMime,
  validateImageUpload
} from '../../../../shared/utils/image-upload-validator.js';
import { resolveFrameOption } from '../../../../config/event-config.js';

export class CreatePhotoUseCase {
  constructor({
    env,
    activeEventConfig,
    photoRepository,
    storageProvider,
    qrCodeProvider,
    imageFrameProvider
  }) {
    this.env = env;
    this.activeEventConfig = activeEventConfig;
    this.photoRepository = photoRepository;
    this.storageProvider = storageProvider;
    this.qrCodeProvider = qrCodeProvider;
    this.imageFrameProvider = imageFrameProvider;
  }

  async execute({ promoterId, frameName, metadata, file }) {
    const photoId = randomUUID();
    const resolvedFrame = resolveFrameOption(this.activeEventConfig, frameName);
    const normalizedFrameName = resolvedFrame?.value || this.activeEventConfig.defaultFrameValue;
    const qrTtlSeconds = this.activeEventConfig.qrCode?.ttlSeconds || 900;
    const qrCreatedAt = new Date();
    const qrExpiresAt = new Date(qrCreatedAt.getTime() + qrTtlSeconds * 1000);
    const validatedImage = await validateImageUpload({
      buffer: file.buffer,
      declaredMime: file.mimetype,
      maxUploadSizeMb: this.env.MAX_UPLOAD_SIZE_MB
    });
    const originalExtension =
      path.extname(file.filename || '') || getExtensionForMime(validatedImage.detectedMime);

    const originalStoredFile = await this.storageProvider.save({
      buffer: file.buffer,
      folder: 'originals',
      fileName: `${photoId}-original${originalExtension}`,
      contentType: validatedImage.detectedMime
    });

    const processedBuffer = await this.imageFrameProvider.process({
      buffer: file.buffer,
      frameName: normalizedFrameName
    });

    const framedStoredFile = await this.storageProvider.save({
      buffer: processedBuffer,
      folder: 'framed',
      fileName: `${photoId}-framed.png`,
      contentType: 'image/png'
    });

    const downloadUrl = buildPublicUrl(
      this.env.APP_BASE_URL,
      `/api/v1/activation/photos/${photoId}/download`
    );
    const publicAccessUrl = buildPublicUrl(
      this.env.APP_BASE_URL,
      `/api/v1/activation/photos/${photoId}/access`
    );

    const qrCodeStoredFile = await this.qrCodeProvider.generate({
      value: publicAccessUrl,
      fileName: `${photoId}-qrcode.png`
    });

    const photo = await this.photoRepository.create({
      id: photoId,
      originalUrl: originalStoredFile.url,
      framedUrl: framedStoredFile.url,
      downloadUrl,
      qrCodeUrl: qrCodeStoredFile.url,
      qrCodeValue: publicAccessUrl,
      status: PhotoStatus.READY,
      frameName: normalizedFrameName,
      promoterId,
      metadata: {
        originalFilename: file.filename,
        originalContentType: validatedImage.detectedMime,
        declaredContentType: file.mimetype,
        outputContentType: 'image/png',
        size: file.size,
        source: {
          width: validatedImage.width,
          height: validatedImage.height
        },
        output: {
          width: resolvedFrame?.outputWidth || 1080,
          height: resolvedFrame?.outputHeight || 1920
        },
        event: {
          key: this.activeEventConfig.key,
          slug: this.activeEventConfig.slug,
          name: this.activeEventConfig.name
        },
        frame: {
          value: resolvedFrame?.value || normalizedFrameName,
          label: resolvedFrame?.label || normalizedFrameName,
          assetUrl: resolvedFrame?.assetUrl || null
        },
        qr: {
          ttlSeconds: qrTtlSeconds,
          createdAt: qrCreatedAt.toISOString(),
          expiresAt: qrExpiresAt.toISOString(),
          accessUrl: publicAccessUrl
        },
        customData: metadata || {},
        storage: {
          originalPath: originalStoredFile.relativePath,
          framedPath: framedStoredFile.relativePath,
          qrCodePath: qrCodeStoredFile.relativePath
        }
      }
    });

    return {
      photo: toPhotoOutput(photo)
    };
  }
}
