import { BadRequestError } from '../../../errors/app-error.js';
import { parseSchema } from '../../../shared/utils/parse-schema.js';
import { sanitizeLogPayload } from '../../../shared/utils/sanitize-log-payload.js';
import { renderPublicPhotoAccessPage } from './public-photo-access-page.js';
import {
  activationPhotoParamsSchema,
  createPhotoSchema,
  reactToPhotoSchema
} from './activation.schemas.js';
import { photoIdParamsSchema } from '../../../shared/utils/query-schemas.js';

async function extractMultipartPayload(request) {
  const fields = {};
  let file = null;

  for await (const part of request.parts()) {
    if (part.type === 'file') {
      if (file) {
        throw new BadRequestError('Envie apenas um arquivo por requisicao');
      }

      const buffer = await part.toBuffer();

      file = {
        buffer,
        filename: part.filename,
        mimetype: part.mimetype,
        size: buffer.length
      };

      continue;
    }

    fields[part.fieldname] = part.value;
  }

  if (!file) {
    throw new BadRequestError('Arquivo da foto obrigatorio');
  }

  let metadata;

  if (fields.metadata) {
    try {
      metadata = JSON.parse(fields.metadata);
    } catch {
      throw new BadRequestError('Metadata invalida');
    }
  }

  request.activityRequestBody = sanitizeLogPayload({
    frameName: fields.frameName,
    metadata,
    file: {
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    }
  });

  return {
    promoterId: request.authUser.id,
    frameName: fields.frameName,
    metadata,
    file
  };
}

export class ActivationController {
  constructor({ photosService, photoRepository }) {
    this.photosService = photosService;
    this.photoRepository = photoRepository;
  }

  async createPhoto(request, reply) {
    const input = parseSchema(
      createPhotoSchema,
      await extractMultipartPayload(request)
    );

    const result = await this.photosService.createPhoto(input);
    return reply.status(201).send(result);
  }

  async getConfig(request, reply) {
    const result = await this.photosService.getActivationConfig();
    return reply.status(200).send(result);
  }

  async getPhotoById(request, reply) {
    const input = parseSchema(activationPhotoParamsSchema, {
      ...request.params,
      requester: request.authUser
    });

    const result = await this.photosService.getPhotoById(input);
    return reply.status(200).send(result);
  }

  async getPhotoQrCode(request, reply) {
    const input = parseSchema(activationPhotoParamsSchema, {
      ...request.params,
      requester: request.authUser
    });

    const result = await this.photosService.getPhotoQrCode(input);
    return reply.status(200).send(result);
  }

  async downloadPhoto(request, reply) {
    const input = parseSchema(photoIdParamsSchema, request.params || {});
    const result = await this.photosService.resolveDownload(input);

    reply.header('content-type', result.contentType);
    reply.header(
      'content-disposition',
      `attachment; filename="${result.fileName}"`
    );

    return reply.send(result.stream);
  }

  async accessPhoto(request, reply) {
    const input = parseSchema(photoIdParamsSchema, request.params || {});
    const result = await this.photosService.getPublicPhotoAccess(input);
    const statusMap = {
      ready: 200,
      expired: 410,
      processing: 202,
      'not-found': 404
    };
    const html = renderPublicPhotoAccessPage({
      status: result.status,
      eventName: result.event?.name,
      downloadUrl: result.photo?.downloadUrl,
      framedUrl: result.photo?.framedUrl,
      expiresAt: result.expiresAt
    });

    reply.header('content-type', 'text/html; charset=utf-8');
    return reply.status(statusMap[result.status] || 200).send(html);
  }

  async reactToPhoto(request, reply) {
    const input = parseSchema(reactToPhotoSchema, {
      ...request.params,
      ...request.body
    });

    const result = await this.photosService.reactToPhoto(input);
    return reply.status(200).send(result);
  }

  async getStats(request, reply) {
    const result = await this.photosService.getStats({
      photoRepository: this.photoRepository
    });
    return reply.status(200).send(result);
  }

  async getHistory(request, reply) {
    const result = await this.photosService.getHistory({
      promoterId: request.authUser.id,
      photoRepository: this.photoRepository
    });
    return reply.status(200).send(result);
  }
}
