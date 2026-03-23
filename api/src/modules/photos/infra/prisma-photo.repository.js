import { PhotoRepository } from '../domain/photo.repository.js';
import { PhotoStatus } from '../domain/enums/photo-status.enum.js';
import { UserRole } from '../../users/domain/enums/user-role.enum.js';

const PRISMA_STATUS_TO_DOMAIN = {
  PROCESSING: PhotoStatus.PROCESSING,
  READY: PhotoStatus.READY,
  FAILED: PhotoStatus.FAILED
};

const DOMAIN_STATUS_TO_PRISMA = {
  [PhotoStatus.PROCESSING]: 'PROCESSING',
  [PhotoStatus.READY]: 'READY',
  [PhotoStatus.FAILED]: 'FAILED'
};

const PRISMA_ROLE_TO_DOMAIN = {
  ADMIN: UserRole.ADMIN,
  PROMOTER: UserRole.PROMOTER
};

function mapPromoter(promoter) {
  if (!promoter) {
    return null;
  }

  return {
    id: promoter.id,
    name: promoter.name,
    email: promoter.email,
    role: PRISMA_ROLE_TO_DOMAIN[promoter.role] || promoter.role
  };
}

function mapPhoto(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    originalUrl: record.originalUrl,
    framedUrl: record.framedUrl,
    downloadUrl: record.downloadUrl,
    qrCodeUrl: record.qrCodeUrl,
    qrCodeValue: record.qrCodeValue,
    status: PRISMA_STATUS_TO_DOMAIN[record.status] || record.status,
    frameName: record.frameName,
    reaction: record.reaction ?? null,
    metadata: record.metadata,
    promoterId: record.promoterId,
    promoter: mapPromoter(record.promoter),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function buildWhere(filters = {}) {
  const where = {};

  if (filters.promoterId) {
    where.promoterId = filters.promoterId;
  }

  if (filters.query) {
    where.OR = [
      { id: { contains: filters.query, mode: 'insensitive' } },
      { frameName: { contains: filters.query, mode: 'insensitive' } },
      {
        promoter: {
          is: {
            name: { contains: filters.query, mode: 'insensitive' }
          }
        }
      },
      {
        promoter: {
          is: {
            email: { contains: filters.query, mode: 'insensitive' }
          }
        }
      }
    ];
  }

  if (filters.frameName) {
    where.frameName = { contains: filters.frameName, mode: 'insensitive' };
  }

  if (filters.reaction) {
    where.reaction =
      filters.reaction === 'none'
        ? null
        : filters.reaction;
  }

  if (filters.status) {
    where.status = DOMAIN_STATUS_TO_PRISMA[filters.status] || filters.status;
  }

  if (filters.createdAt) {
    where.createdAt = filters.createdAt;
  }

  return where;
}

export class PrismaPhotoRepository extends PhotoRepository {
  constructor({ prismaClient }) {
    super();
    this.prisma = prismaClient.client;
  }

  async create(input) {
    const record = await this.prisma.photo.create({
      data: {
        id: input.id,
        originalUrl: input.originalUrl,
        framedUrl: input.framedUrl,
        downloadUrl: input.downloadUrl,
        qrCodeUrl: input.qrCodeUrl,
        qrCodeValue: input.qrCodeValue,
        status: DOMAIN_STATUS_TO_PRISMA[input.status] || input.status,
        frameName: input.frameName,
        metadata: input.metadata,
        promoterId: input.promoterId
      },
      include: {
        promoter: true
      }
    });

    return mapPhoto(record);
  }

  async updateById(id, input) {
    const record = await this.prisma.photo.update({
      where: { id },
      data: {
        ...(input.originalUrl ? { originalUrl: input.originalUrl } : {}),
        ...(input.framedUrl ? { framedUrl: input.framedUrl } : {}),
        ...(input.downloadUrl ? { downloadUrl: input.downloadUrl } : {}),
        ...(input.qrCodeUrl !== undefined ? { qrCodeUrl: input.qrCodeUrl } : {}),
        ...(input.qrCodeValue !== undefined
          ? { qrCodeValue: input.qrCodeValue }
          : {}),
        ...(input.status
          ? { status: DOMAIN_STATUS_TO_PRISMA[input.status] || input.status }
          : {}),
        ...(input.frameName !== undefined ? { frameName: input.frameName } : {}),
        ...(input.reaction !== undefined ? { reaction: input.reaction } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {})
      },
      include: {
        promoter: true
      }
    });

    return mapPhoto(record);
  }

  async findById(id) {
    const record = await this.prisma.photo.findUnique({
      where: { id },
      include: {
        promoter: true
      }
    });

    return mapPhoto(record);
  }

  async paginate({ filters, page, limit, skip }) {
    const where = buildWhere(filters);

    const [records, total] = await this.prisma.$transaction([
      this.prisma.photo.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          promoter: true
        }
      }),
      this.prisma.photo.count({ where })
    ]);

    return {
      items: records.map(mapPhoto),
      total,
      page,
      limit
    };
  }

  async count(filters = {}) {
    const where = buildWhere(filters);
    return this.prisma.photo.count({ where });
  }

  async countGroupedByStatus(filters = {}) {
    const where = buildWhere(filters);

    const groups = await this.prisma.photo.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    });

    return groups.reduce((acc, g) => {
      const status = PRISMA_STATUS_TO_DOMAIN[g.status] || g.status;
      acc[status] = g._count.status;
      return acc;
    }, {});
  }

  async countGroupedByReaction(filters = {}) {
    const where = buildWhere(filters);

    const [liked, disliked, total] = await this.prisma.$transaction([
      this.prisma.photo.count({ where: { ...where, reaction: 'liked' } }),
      this.prisma.photo.count({ where: { ...where, reaction: 'disliked' } }),
      this.prisma.photo.count({ where: { ...where, reaction: { not: null } } })
    ]);

    return { liked, disliked, total };
  }

  async countToday(timezone = 'America/Sao_Paulo') {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const [{ value: year }, , { value: month }, , { value: day }] =
      formatter.formatToParts(now);
    const startOfDay = new Date(`${year}-${month}-${day}T00:00:00`);
    const endOfDay   = new Date(`${year}-${month}-${day}T23:59:59.999`);

    // Converte para UTC usando o offset do timezone
    const offsetMs = startOfDay.getTime() - new Date(startOfDay.toLocaleString('en-US', { timeZone: 'UTC' })).getTime();

    return this.prisma.photo.count({
      where: {
        createdAt: {
          gte: new Date(startOfDay.getTime() - offsetMs),
          lte: new Date(endOfDay.getTime()   - offsetMs)
        }
      }
    });
  }

  async findByPromoterRecent(promoterId, limit = 6) {
    const records = await this.prisma.photo.findMany({
      where: { promoterId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { promoter: true }
    });
    return records.map(mapPhoto);
  }}
