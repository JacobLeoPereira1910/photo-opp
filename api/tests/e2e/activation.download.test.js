import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { asValue } from 'awilix';
import { buildTestApp } from '../helpers/build-test-app.js';

function createAccessToken(app, payload) {
  return app.jwt.sign(payload);
}

test('GET /api/v1/activation/photos/:id/qrcode exposes download metadata', async () => {
  const app = await buildTestApp({
    photosService: asValue({
      async createPhoto() {
        return { photo: { id: 'photo-1' } };
      },
      async getActivationConfig() {
        return { event: { key: 'nexlab-default' } };
      },
      async getPhotoById() {
        return { photo: { id: 'photo-1' } };
      },
      async getPhotoQrCode({ id }) {
        return {
          photoId: id,
          qrCodeUrl: '/storage/qrcodes/photo-1.png',
          qrCodeValue: 'http://localhost:3333/api/v1/activation/photos/photo-1/download',
          downloadUrl: 'http://localhost:3333/api/v1/activation/photos/photo-1/download',
          expiresAt: '2026-03-23T15:00:00.000Z',
          ttlSeconds: 900
        };
      },
      async resolveDownload({ id }) {
        return {
          fileName: `${id}.png`,
          contentType: 'image/png',
          stream: Readable.from(Buffer.from('png-binary'))
        };
      },
      async reactToPhoto() {
        return { photo: { id: 'photo-1', reaction: 'liked' } };
      },
      async getStats() {
        return { todayPhotos: 1 };
      },
      async getHistory() {
        return { photos: [] };
      }
    })
  });

  try {
    const token = createAccessToken(app, {
      sub: 'promoter-1',
      name: 'Promoter User',
      email: 'promoter@nexlab.com',
      role: 'promoter'
    });

    const qrResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/activation/photos/photo-1/qrcode',
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    assert.equal(qrResponse.statusCode, 200);

    const qrPayload = qrResponse.json();

    assert.equal(qrPayload.photoId, 'photo-1');
    assert.equal(qrPayload.ttlSeconds, 900);
    assert.equal(
      qrPayload.downloadUrl,
      'http://localhost:3333/api/v1/activation/photos/photo-1/download'
    );

    const downloadResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/activation/photos/photo-1/download'
    });

    assert.equal(downloadResponse.statusCode, 200);
    assert.equal(downloadResponse.headers['content-type'], 'image/png');
    assert.match(
      downloadResponse.headers['content-disposition'],
      /attachment; filename="photo-1\.png"/
    );
    assert.equal(downloadResponse.body, 'png-binary');
  } finally {
    await app.close();
  }
});
