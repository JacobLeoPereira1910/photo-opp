import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/build-test-app.js';

function createAccessToken(app, payload) {
  return app.jwt.sign(payload);
}

test('GET /api/v1/admin/dashboard/metrics blocks promoter and allows admin', async () => {
  const app = await buildTestApp();

  try {
    const promoterToken = createAccessToken(app, {
      sub: 'promoter-1',
      name: 'Promoter User',
      email: 'promoter@nexlab.com',
      role: 'promoter'
    });

    const promoterResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/dashboard/metrics',
      headers: {
        authorization: `Bearer ${promoterToken}`
      }
    });

    assert.equal(promoterResponse.statusCode, 403);

    const adminToken = createAccessToken(app, {
      sub: 'admin-1',
      name: 'Admin User',
      email: 'admin@nexlab.com',
      role: 'admin'
    });

    const adminResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/dashboard/metrics',
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    assert.equal(adminResponse.statusCode, 200);

    const body = adminResponse.json();

    assert.equal(body.totalPhotos, 10);
    assert.equal(body.filteredPhotos, 5);
  } finally {
    await app.close();
  }
});
