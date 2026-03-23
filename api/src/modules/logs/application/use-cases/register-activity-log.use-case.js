import { maskIp } from '../../../../shared/utils/mask-ip.js';

export class RegisterActivityLogUseCase {
  constructor({ logRepository }) {
    this.logRepository = logRepository;
  }

  async execute(input) {
    return this.logRepository.create({
      requestId: input.requestId,
      userId: input.userId,
      emailAttempted: input.emailAttempted,
      action: input.action,
      method: input.method,
      route: input.route,
      ip: maskIp(input.ip),
      requestBody: input.requestBody || null,
      responseStatus: input.responseStatus,
      metadata: input.metadata || null
    });
  }
}
