import { UnauthorizedError } from '../../../../errors/app-error.js';

export class GetUserByIdUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError('Invalid session', {
        code: 'INVALID_SESSION'
      });
    }

    return user;
  }
}
