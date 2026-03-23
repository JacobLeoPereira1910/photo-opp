import { toLogCsvRow } from '../../../../shared/mappers/log.mapper.js';
import { buildCsv } from '../../../../shared/utils/to-csv.js';

function buildFileName() {
  return `logs-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
}

export class AdminExportLogsUseCase {
  constructor({ logRepository }) {
    this.logRepository = logRepository;
  }

  async execute({ filters }) {
    const logs = await this.logRepository.findManyForExport(filters);
    const rows = logs.map(toLogCsvRow);

    return {
      fileName: buildFileName(),
      csv: buildCsv(rows),
      total: logs.length
    };
  }
}
