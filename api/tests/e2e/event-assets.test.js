import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/build-test-app.js';

test('GET /event-assets/nexlab-default/frame-overlay.svg serves the configured frame asset', async () => {
  const app = await buildTestApp();

  try {
    const response = await app.inject({
      method: 'GET',
      url: '/event-assets/nexlab-default/frame-overlay.svg'
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'], /image\/svg\+xml/);
    assert.match(response.body, /<svg/);
    assert.match(response.body, /clipPath/);
  } finally {
    await app.close();
  }
});
