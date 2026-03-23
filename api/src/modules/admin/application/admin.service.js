import { buildDateRange } from '../../../shared/utils/build-date-range.js';
import { normalizePagination } from '../../../shared/utils/pagination.js';

function buildPhotoFilters(payload, timezone) {
  const createdAt = buildDateRange(payload, timezone);

  return {
    ...(payload.query ? { query: payload.query } : {}),
    ...(payload.frameName ? { frameName: payload.frameName } : {}),
    ...(payload.reaction ? { reaction: payload.reaction } : {}),
    ...(payload.status ? { status: payload.status } : {}),
    ...(createdAt ? { createdAt } : {})
  };
}

function buildLogFilters(payload, timezone) {
  const createdAt = buildDateRange(payload, timezone);

  return {
    ...(payload.action ? { action: payload.action } : {}),
    ...(createdAt ? { createdAt } : {})
  };
}

export class AdminService {
  constructor({
    env,
    getDashboardMetricsUseCase,
    adminListPhotosUseCase,
    adminGetPhotoUseCase,
    adminGetPhotoQrCodeUseCase,
    adminListLogsUseCase,
    adminExportLogsUseCase
  }) {
    this.env = env;
    this.getDashboardMetricsUseCase = getDashboardMetricsUseCase;
    this.adminListPhotosUseCase = adminListPhotosUseCase;
    this.adminGetPhotoUseCase = adminGetPhotoUseCase;
    this.adminGetPhotoQrCodeUseCase = adminGetPhotoQrCodeUseCase;
    this.adminListLogsUseCase = adminListLogsUseCase;
    this.adminExportLogsUseCase = adminExportLogsUseCase;
  }

  async getDashboardMetrics(input) {
    return this.getDashboardMetricsUseCase.execute({
      filters: buildPhotoFilters(input, this.env.APP_TIMEZONE)
    });
  }

  async listPhotos(input) {
    const pagination = normalizePagination(input);

    return this.adminListPhotosUseCase.execute({
      ...pagination,
      filters: buildPhotoFilters(input, this.env.APP_TIMEZONE)
    });
  }

  async getPhotoById(input) {
    return this.adminGetPhotoUseCase.execute(input);
  }

  async getPhotoQrCode(input) {
    return this.adminGetPhotoQrCodeUseCase.execute(input);
  }

  async listLogs(input) {
    const pagination = normalizePagination(input);

    return this.adminListLogsUseCase.execute({
      ...pagination,
      filters: buildLogFilters(input, this.env.APP_TIMEZONE)
    });
  }

  async exportLogs(input) {
    return this.adminExportLogsUseCase.execute({
      filters: buildLogFilters(input, this.env.APP_TIMEZONE)
    });
  }
}
