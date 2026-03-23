import { toAuthenticatedUser, toTokenPayload } from '../../../../shared/mappers/user.mapper.js';
import { InvalidEmailLoginAttemptError } from '../../domain/errors/invalid-email-login-attempt.error.js';
import { InvalidPasswordLoginAttemptError } from '../../domain/errors/invalid-password-login-attempt.error.js';

export class LoginUseCase {
  constructor({ env, userRepository, hashProvider, tokenProvider }) {
    this.env = env;
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
    this.tokenProvider = tokenProvider;
  }

  async execute({ email, password }) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidEmailLoginAttemptError();
    }

    const passwordMatches = await this.hashProvider.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      throw new InvalidPasswordLoginAttemptError();
    }

    const accessToken = await this.tokenProvider.createAccessToken(
      toTokenPayload(user)
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.env.JWT_EXPIRES_IN,
      user: toAuthenticatedUser(user)
    };
  }
}
