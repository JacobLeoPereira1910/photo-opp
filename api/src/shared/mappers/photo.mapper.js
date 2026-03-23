import { toUserSummary } from './user.mapper.js';

function sanitizeMetadata(metadata) {
  if (!metadata) {
    return {};
  }

  const safeMetadata = { ...metadata };
  delete safeMetadata.storage;
  return safeMetadata;
}

function normalizeLocalUrl(value) {
  if (!value) {
    return value;
  }

  try {
    const parsed = new URL(value);

    if (
      process.env.NODE_ENV !== 'production' &&
      parsed.hostname === 'localhost' &&
      parsed.protocol === 'http:'
    ) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return value;
  } catch {
    return value;
  }
}

export function toPhotoOutput(photo) {
  return {
    id: photo.id,
    status: photo.status,
    frameName: photo.frameName,
    reaction: photo.reaction ?? null,
    originalUrl: normalizeLocalUrl(photo.originalUrl),
    framedUrl: normalizeLocalUrl(photo.framedUrl),
    downloadUrl: normalizeLocalUrl(photo.downloadUrl),
    qrCodeUrl: normalizeLocalUrl(photo.qrCodeUrl),
    qrCodeValue: photo.qrCodeValue,
    metadata: sanitizeMetadata(photo.metadata),
    promoter: toUserSummary(photo.promoter),
    createdAt: photo.createdAt?.toISOString?.() || photo.createdAt,
    updatedAt: photo.updatedAt?.toISOString?.() || photo.updatedAt
  };
}
