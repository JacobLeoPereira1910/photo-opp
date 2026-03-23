import { OtpExpiredError } from '../../domain/errors/otp-expired.error.js';
import { InvalidOtpError } from '../../domain/errors/invalid-otp.error.js';

export class VerifyOtpUseCase {
  constructor({ passwordResetTokenRepository }) {
    this.passwordResetTokenRepository = passwordResetTokenRepository;
  }

  async execute({ email, otp }) {
    const token = await this.passwordResetTokenRepository.findPendingByEmail(email);

    if (!token) {
      throw new OtpExpiredError();
    }

    if (token.otp !== otp) {
      throw new InvalidOtpError();
    }

    const resetToken = await this.passwordResetTokenRepository.markOtpVerified(token.id);

    return { resetToken };
  }
}
