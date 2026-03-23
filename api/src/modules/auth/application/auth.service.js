export class AuthService {
  constructor({
    loginUseCase,
    getAuthenticatedUserUseCase,
    requestPasswordResetUseCase,
    verifyOtpUseCase,
    resetPasswordUseCase
  }) {
    this.loginUseCase = loginUseCase;
    this.getAuthenticatedUserUseCase = getAuthenticatedUserUseCase;
    this.requestPasswordResetUseCase = requestPasswordResetUseCase;
    this.verifyOtpUseCase = verifyOtpUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;
  }

  async login(input) {
    return this.loginUseCase.execute(input);
  }

  async getMe(input) {
    return this.getAuthenticatedUserUseCase.execute(input);
  }

  async requestPasswordReset(input) {
    return this.requestPasswordResetUseCase.execute(input);
  }

  async verifyOtp(input) {
    return this.verifyOtpUseCase.execute(input);
  }

  async resetPassword(input) {
    return this.resetPasswordUseCase.execute(input);
  }
}
