import test from 'node:test';
import assert from 'node:assert/strict';
import { asValue } from 'awilix';
import { buildTestApp } from '../helpers/build-test-app.js';

test('GET /api/v1/activation/photos/:id/access renders a public ready state page', async () => {
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
      async getPhotoQrCode() {
        return {
          photoId: 'photo-1',
          qrCodeUrl: '/storage/qrcodes/photo-1.png',
          qrCodeValue: 'http://localhost:3333/api/v1/activation/photos/photo-1/access',
          downloadUrl: 'http://localhost:3333/api/v1/activation/photos/photo-1/download'
        };
      },
      async getPublicPhotoAccess() {
        return {
          status: 'ready',
          event: { name: 'NEX.lab Photo Opp' },
          photo: {
            id: 'photo-1',
            framedUrl: 'http://localhost:3333/storage/framed/photo-1.png',
            downloadUrl: 'http://localhost:3333/api/v1/activation/photos/photo-1/download'
          },
          expiresAt: '2026-03-23T15:00:00.000Z'
        };
      },
      async resolveDownload() {
        throw new Error('resolveDownload not stubbed');
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
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/activation/photos/photo-1/access'
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'], /text\/html/);
    assert.match(response.body, /Sua foto esta pronta/);
    assert.match(response.body, /Baixar foto final/);
  } finally {
    await app.close();
  }
});

test('GET /api/v1/activation/photos/:id/access renders an expired page', async () => {
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
      async getPhotoQrCode() {
        return {
          photoId: 'photo-1',
          qrCodeUrl: '/storage/qrcodes/photo-1.png',
          qrCodeValue: 'http://localhost:3333/api/v1/activation/photos/photo-1/access',
          downloadUrl: 'http://localhost:3333/api/v1/activation/photos/photo-1/download'
        };
      },
      async getPublicPhotoAccess() {
        return {
          status: 'expired',
          event: { name: 'NEX.lab Photo Opp' },
          photo: {
            id: 'photo-1',
            framedUrl: 'http://localhost:3333/storage/framed/photo-1.png',
            downloadUrl: 'http://localhost:3333/api/v1/activation/photos/photo-1/download'
          },
          expiresAt: '2026-03-23T15:00:00.000Z'
        };
      },
      async resolveDownload() {
        throw new Error('resolveDownload not stubbed');
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
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/activation/photos/photo-1/access'
    });

    assert.equal(response.statusCode, 410);
    assert.match(response.body, /Este QR Code expirou/);
    assert.doesNotMatch(response.body, /Baixar foto final/);
  } finally {
    await app.close();
  }
});
