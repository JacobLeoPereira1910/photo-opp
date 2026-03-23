export class ActivityLoggerService {
  constructor({ registerActivityLogUseCase }) {
    this.registerActivityLogUseCase = registerActivityLogUseCase;
  }

  async logHttpRequest(input) {
    return this.registerActivityLogUseCase.execute(input);
  }
}
