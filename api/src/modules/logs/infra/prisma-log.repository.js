import { LogRepository } from '../domain/log.repository.js';

function mapLog(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    requestId: record.requestId,
    userId: record.userId,
    emailAttempted: record.emailAttempted,
    action: record.action,
    method: record.method,
    route: record.route,
    ip: record.ip,
    requestBody: record.requestBody,
    responseStatus: record.responseStatus,
    metadata: record.metadata,
    createdAt: record.createdAt
  };
}

function buildWhere(filters = {}) {
  const where = {};

  if (filters.createdAt) {
    where.createdAt = filters.createdAt;
  }

  if (filters.action) {
    where.action = filters.action;
  }

  return where;
}

export class PrismaLogRepository extends LogRepository {
  constructor({ prismaClient }) {
    super();
    this.prisma = prismaClient.client;
  }

  async create(input) {
    const record = await this.prisma.log.create({
      data: {
        requestId: input.requestId,
        userId: input.userId,
        emailAttempted: input.emailAttempted,
        action: input.action,
        method: input.method,
        route: input.route,
        ip: input.ip,
        requestBody: input.requestBody,
        responseStatus: input.responseStatus,
        metadata: input.metadata
      }
    });

    return mapLog(record);
  }

  async paginate({ filters, page, limit, skip }) {
    const where = buildWhere(filters);

    const [records, total] = await this.prisma.$transaction([
      this.prisma.log.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.log.count({ where })
    ]);

    return {
      items: records.map(mapLog),
      total,
      page,
      limit
    };
  }

  async findManyForExport(filters = {}) {
    const where = buildWhere(filters);

    const records = await this.prisma.log.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return records.map(mapLog);
  }
}
