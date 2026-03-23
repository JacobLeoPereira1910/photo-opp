import { randomUUID } from 'node:crypto';

export class PrismaPasswordResetTokenRepository {
  constructor({ prismaClient }) {
    this.prisma = prismaClient.client;
  }

  async create(email, otp) {
    // Invalida tokens anteriores do mesmo email
    await this.prisma.passwordResetToken.deleteMany({ where: { email } });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    return this.prisma.passwordResetToken.create({
      data: { email, otp, expiresAt }
    });
  }

  async findPendingByEmail(email) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
        usedAt: null,
        resetToken: null
      }
    });
  }

  async markOtpVerified(id) {
    const resetToken = randomUUID();

    await this.prisma.passwordResetToken.update({
      where: { id },
      data: { resetToken }
    });

    return resetToken;
  }

  async findValidResetToken(resetToken) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { resetToken }
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return null;
    }

    return record;
  }

  async markUsed(id) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() }
    });
  }
}
