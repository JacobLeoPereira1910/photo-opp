import { parseSchema } from '../../../shared/utils/parse-schema.js';
import {
  adminExportLogsQuerySchema,
  adminListLogsQuerySchema,
  adminListPhotosQuerySchema,
  adminMetricsQuerySchema,
  adminPhotoParamsSchema
} from './admin.schemas.js';

export class AdminController {
  constructor({ adminService }) {
    this.adminService = adminService;
  }

  async getDashboardMetrics(request, reply) {
    const input = parseSchema(adminMetricsQuerySchema, request.query || {});
    const result = await this.adminService.getDashboardMetrics(input);
    return reply.status(200).send(result);
  }

  async listPhotos(request, reply) {
    const input = parseSchema(adminListPhotosQuerySchema, request.query || {});
    const result = await this.adminService.listPhotos(input);
    return reply.status(200).send(result);
  }

  async getPhotoById(request, reply) {
    const input = parseSchema(adminPhotoParamsSchema, request.params);
    const result = await this.adminService.getPhotoById(input);
    return reply.status(200).send(result);
  }

  async getPhotoQrCode(request, reply) {
    const input = parseSchema(adminPhotoParamsSchema, request.params);
    const result = await this.adminService.getPhotoQrCode(input);
    return reply.status(200).send(result);
  }

  async listLogs(request, reply) {
    const input = parseSchema(adminListLogsQuerySchema, request.query || {});
    const result = await this.adminService.listLogs(input);
    return reply.status(200).send(result);
  }

  async exportLogs(request, reply) {
    const input = parseSchema(adminExportLogsQuerySchema, request.query || {});
    const result = await this.adminService.exportLogs(input);

    reply.header('content-type', 'text/csv; charset=utf-8');
    reply.header(
      'content-disposition',
      `attachment; filename="${result.fileName}"`
    );

    return reply.status(200).send(result.csv);
  }
}
