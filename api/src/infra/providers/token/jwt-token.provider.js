import { TokenProvider } from '../../../shared/contracts/token-provider.js';

export class JwtTokenProvider extends TokenProvider {
  constructor({ jwt, env }) {
    super();
    this.jwt = jwt;
    this.env = env;
  }

  async createAccessToken(payload) {
    const { sub, ...claims } = payload;

    return this.jwt.sign(claims, {
      sub,
      expiresIn: this.env.JWT_EXPIRES_IN
    });
  }
}
