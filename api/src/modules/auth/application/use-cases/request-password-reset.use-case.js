import { InvalidEmailLoginAttemptError } from '../../domain/errors/invalid-email-login-attempt.error.js';

export class RequestPasswordResetUseCase {
  constructor({ env, userRepository, passwordResetTokenRepository }) {
    this.env = env;
    this.userRepository = userRepository;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
  }

  async execute({ email }) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidEmailLoginAttemptError();
    }

    // Gera OTP de 4 dígitos
    const otp = String(Math.floor(1000 + Math.random() * 9000));

    await this.passwordResetTokenRepository.create(email, otp);

    // Em produção: enviar OTP por email (ex: nodemailer, Resend, SendGrid)
    // Em desenvolvimento: retornamos o OTP na resposta para facilitar testes
    const isProduction = this.env.NODE_ENV === 'production';

    return {
      message: 'Codigo enviado para o email informado.',
      ...(isProduction ? {} : { otp })
    };
  }
}
