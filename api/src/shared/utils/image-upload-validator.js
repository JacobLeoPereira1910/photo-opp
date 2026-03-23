import sharp from 'sharp';
import { BadRequestError } from '../../errors/app-error.js';

const SUPPORTED_FORMAT_TO_MIME = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
};

const MIME_TO_EXTENSION = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

function normalizeMime(value) {
  if (!value) {
    return null;
  }

  if (value === 'image/jpg') {
    return 'image/jpeg';
  }

  return value.toLowerCase();
}

export function getExtensionForMime(mime) {
  return MIME_TO_EXTENSION[mime] || '.bin';
}

export async function validateImageUpload({
  buffer,
  declaredMime,
  maxUploadSizeMb
}) {
  if (!buffer?.length) {
    throw new BadRequestError('Arquivo de imagem vazio ou invalido.', {
      code: 'INVALID_IMAGE_UPLOAD'
    });
  }

  const maxBytes = maxUploadSizeMb * 1024 * 1024;

  if (maxBytes > 0 && buffer.length > maxBytes) {
    throw new BadRequestError(
      `A imagem excede o limite de ${maxUploadSizeMb} MB.`,
      {
        code: 'IMAGE_TOO_LARGE',
        statusCode: 413,
        details: {
          maxUploadSizeMb
        }
      }
    );
  }

  let metadata;

  try {
    metadata = await sharp(buffer, {
      failOn: 'error'
    }).metadata();
  } catch (error) {
    throw new BadRequestError(
      'Envie uma imagem valida em PNG, JPG ou WEBP.',
      {
        code: 'INVALID_IMAGE_UPLOAD',
        cause: error
      }
    );
  }

  const detectedMime = SUPPORTED_FORMAT_TO_MIME[metadata.format];

  if (!detectedMime) {
    throw new BadRequestError(
      'Formato nao suportado. Use PNG, JPG ou WEBP.',
      {
        code: 'UNSUPPORTED_IMAGE_MIME',
        details: {
          allowedMimes: Object.values(SUPPORTED_FORMAT_TO_MIME)
        }
      }
    );
  }

  const normalizedDeclaredMime = normalizeMime(declaredMime);

  if (
    normalizedDeclaredMime &&
    normalizedDeclaredMime.startsWith('image/') &&
    normalizedDeclaredMime !== detectedMime
  ) {
    throw new BadRequestError(
      'O tipo do arquivo nao corresponde ao conteudo real da imagem.',
      {
        code: 'IMAGE_MIME_MISMATCH',
        details: {
          declaredMime: normalizedDeclaredMime,
          detectedMime
        }
      }
    );
  }

  return {
    detectedMime,
    width: metadata.width || null,
    height: metadata.height || null
  };
}
