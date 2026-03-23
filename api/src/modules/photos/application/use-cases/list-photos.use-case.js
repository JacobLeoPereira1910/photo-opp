import { buildPaginatedResponse } from '../../../../shared/utils/pagination.js';
import { toPhotoOutput } from '../../../../shared/mappers/photo.mapper.js';

export class ListPhotosUseCase {
  constructor({ photoRepository }) {
    this.photoRepository = photoRepository;
  }

  async execute({ filters, page, limit, skip }) {
    const result = await this.photoRepository.paginate({
      filters,
      page,
      limit,
      skip
    });

    return buildPaginatedResponse({
      items: result.items.map(toPhotoOutput),
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  }
}
