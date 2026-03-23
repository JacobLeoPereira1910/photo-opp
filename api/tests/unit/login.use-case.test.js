import test from 'node:test';
import assert from 'node:assert/strict';
import { LoginUseCase } from '../../src/modules/auth/application/use-cases/login.use-case.js';
import { InvalidEmailLoginAttemptError } from '../../src/modules/auth/domain/errors/invalid-email-login-attempt.error.js';
import { InvalidPasswordLoginAttemptError } from '../../src/modules/auth/domain/errors/invalid-password-login-attempt.error.js';

function makeSut(overrides = {}) {
  return new LoginUseCase({
    env: {
      JWT_EXPIRES_IN: '8h'
    },
    userRepository: {
      async findByEmail(email) {
        if (email === 'admin@nexlab.com') {
          return {
            id: 'admin-1',
            name: 'Admin User',
            email,
            passwordHash: 'hashed-password',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }

        return null;
      }
    },
    hashProvider: {
      async compare(value) {
        return value === '123456';
      }
    },
    tokenProvider: {
      async createAccessToken(payload) {
        return `token-for-${payload.sub}`;
      }
    },
    ...overrides
  });
}

test('LoginUseCase throws when email does not exist', async () => {
  const sut = makeSut();

  await assert.rejects(
    () => sut.execute({ email: 'missing@nexlab.com', password: '123456' }),
    InvalidEmailLoginAttemptError
  );
});

test('LoginUseCase throws when password is invalid', async () => {
  const sut = makeSut();

  await assert.rejects(
    () => sut.execute({ email: 'admin@nexlab.com', password: 'wrong' }),
    InvalidPasswordLoginAttemptError
  );
});

test('LoginUseCase returns token and user when credentials are valid', async () => {
  const sut = makeSut();

  const result = await sut.execute({
    email: 'admin@nexlab.com',
    password: '123456'
  });

  assert.equal(result.accessToken, 'token-for-admin-1');
  assert.equal(result.user.email, 'admin@nexlab.com');
  assert.equal(result.user.role, 'admin');
});
