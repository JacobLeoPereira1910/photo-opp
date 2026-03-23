import bcrypt from 'bcryptjs';
import { HashProvider } from '../../../shared/contracts/hash-provider.js';

export class BcryptHashProvider extends HashProvider {
  constructor({ env }) {
    super();
    this.saltRounds = env.BCRYPT_SALT_ROUNDS;
  }

  async hash(value) {
    return bcrypt.hash(value, this.saltRounds);
  }

  async compare(value, hashedValue) {
    return bcrypt.compare(value, hashedValue);
  }
}
