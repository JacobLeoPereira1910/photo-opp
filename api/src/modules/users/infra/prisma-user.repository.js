import { UserRepository } from '../domain/user.repository.js';
import { UserRole } from '../domain/enums/user-role.enum.js';

const PRISMA_ROLE_TO_DOMAIN = {
  ADMIN: UserRole.ADMIN,
  PROMOTER: UserRole.PROMOTER
};

export const DOMAIN_ROLE_TO_PRISMA = {
  [UserRole.ADMIN]: 'ADMIN',
  [UserRole.PROMOTER]: 'PROMOTER'
};

function mapUser(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    name: record.name,
    email: record.email,
    passwordHash: record.passwordHash,
    role: PRISMA_ROLE_TO_DOMAIN[record.role] || record.role,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

export class PrismaUserRepository extends UserRepository {
  constructor({ prismaClient }) {
    super();
    this.prisma = prismaClient.client;
  }

  async findByEmail(email) {
    const record = await this.prisma.user.findUnique({
      where: {
        email: String(email).trim().toLowerCase()
      }
    });

    return mapUser(record);
  }

  async findById(id) {
    const record = await this.prisma.user.findUnique({
      where: { id }
    });

    return mapUser(record);
  }

  async updatePasswordHash(id, passwordHash) {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash }
    });
  }
}
