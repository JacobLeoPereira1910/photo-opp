import test from 'node:test';
import assert from 'node:assert/strict';
import { asValue } from 'awilix';
import { buildTestApp } from '../helpers/build-test-app.js';

test('POST /api/v1/auth/login returns authenticated user payload', async () => {
  const app = await buildTestApp({
    authService: asValue({
      async login({ email }) {
        return {
          accessToken: 'jwt-token',
          tokenType: 'Bearer',
          expiresIn: '8h',
          user: {
            id: 'admin-1',
            name: 'Admin User',
            email,
            role: 'admin'
          }
        };
      },
      async getMe() {
        return {
          user: {
            id: 'admin-1',
            name: 'Admin User',
            email: 'admin@nexlab.com',
            role: 'admin'
          }
        };
      }
    })
  });

  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'admin@nexlab.com',
        password: '123456'
      }
    });

    assert.equal(response.statusCode, 200);

    const body = response.json();

    assert.equal(body.accessToken, 'jwt-token');
    assert.equal(body.user.email, 'admin@nexlab.com');
    assert.equal(body.user.role, 'admin');
  } finally {
    await app.close();
  }
});

test('POST /api/v1/auth/login validates payload before hitting service', async () => {
  let called = false;

  const app = await buildTestApp({
    authService: asValue({
      async login() {
        called = true;
        return {};
      },
      async getMe() {
        return { user: null };
      }
    })
  });

  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'invalid-email',
        password: ''
      }
    });

    assert.equal(response.statusCode, 400);
    assert.equal(called, false);
  } finally {
    await app.close();
  }
});
