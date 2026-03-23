import { InvalidResetTokenError } from '../../domain/errors/invalid-reset-token.error.js';

export class ResetPasswordUseCase {
  constructor({ passwordResetTokenRepository, userRepository, hashProvider }) {
    this.passwordResetTokenRepository = passwordResetTokenRepository;
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
  }

  async execute({ resetToken, password }) {
    const token = await this.passwordResetTokenRepository.findValidResetToken(resetToken);

    if (!token) {
      throw new InvalidResetTokenError();
    }

    const user = await this.userRepository.findByEmail(token.email);

    if (!user) {
      throw new InvalidResetTokenError();
    }

    const passwordHash = await this.hashProvider.hash(password);

    await this.userRepository.updatePasswordHash(user.id, passwordHash);
    await this.passwordResetTokenRepository.markUsed(token.id);

    return { message: 'Senha redefinida com sucesso.' };
  }
}
