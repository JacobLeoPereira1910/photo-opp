import { buildPaginatedResponse } from '../../../../shared/utils/pagination.js';
import { toLogOutput } from '../../../../shared/mappers/log.mapper.js';

export class ListLogsUseCase {
  constructor({ logRepository }) {
    this.logRepository = logRepository;
  }

  async execute({ filters, page, limit, skip }) {
    const result = await this.logRepository.paginate({
      filters,
      page,
      limit,
      skip
    });

    return buildPaginatedResponse({
      items: result.items.map(toLogOutput),
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  }
}
