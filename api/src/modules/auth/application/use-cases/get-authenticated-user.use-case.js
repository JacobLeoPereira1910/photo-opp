import { toAuthenticatedUser } from '../../../../shared/mappers/user.mapper.js';

export class GetAuthenticatedUserUseCase {
  constructor({ getUserByIdUseCase }) {
    this.getUserByIdUseCase = getUserByIdUseCase;
  }

  async execute({ userId }) {
    const user = await this.getUserByIdUseCase.execute(userId);

    return {
      user: toAuthenticatedUser(user)
    };
  }
}
