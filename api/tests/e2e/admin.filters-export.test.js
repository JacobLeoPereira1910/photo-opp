import test from 'node:test';
import assert from 'node:assert/strict';
import { asValue } from 'awilix';
import { buildTestApp } from '../helpers/build-test-app.js';

function createAccessToken(app, payload) {
  return app.jwt.sign(payload);
}

test('admin photo filters and log export preserve query parameters', async () => {
  let listPhotosInput = null;
  let exportLogsInput = null;

  const app = await buildTestApp({
    adminService: asValue({
      async getDashboardMetrics() {
        return {
          totalPhotos: 10,
          filteredPhotos: 5,
          todayPhotos: 2,
          statusBreakdown: {
            processing: 1,
            ready: 4,
            failed: 0
          },
          reactions: {
            liked: 3,
            disliked: 1,
            total: 4
          }
        };
      },
      async listPhotos(input) {
        listPhotosInput = input;

        return {
          page: 2,
          limit: 25,
          total: 1,
          totalPages: 1,
          items: []
        };
      },
      async getPhotoById() {
        return { photo: { id: 'photo-1' } };
      },
      async getPhotoQrCode() {
        return {
          photoId: 'photo-1',
          qrCodeUrl: '/storage/qrcodes/photo-1.png',
          qrCodeValue: 'value',
          downloadUrl: 'download'
        };
      },
      async listLogs() {
        return {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
          items: []
        };
      },
      async exportLogs(input) {
        exportLogsInput = input;

        return {
          fileName: 'logs.csv',
          csv: 'id,action\n1,auth.login.success',
          total: 1
        };
      }
    })
  });

  try {
    const token = createAccessToken(app, {
      sub: 'admin-1',
      name: 'Admin User',
      email: 'admin@nexlab.com',
      role: 'admin'
    });

    const photosResponse = await app.inject({
      method: 'GET',
      url:
        '/api/v1/admin/photos?page=2&limit=25&startDate=2026-03-23&endDate=2026-03-23&startTime=09:00&endTime=18:00&query=ana&frameName=NEXLAB%20FIGMA&reaction=none&status=ready',
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    assert.equal(photosResponse.statusCode, 200);
    assert.ok(listPhotosInput);
    assert.equal(listPhotosInput.page, 2);
    assert.equal(listPhotosInput.limit, 25);
    assert.equal(listPhotosInput.query, 'ana');
    assert.equal(listPhotosInput.frameName, 'NEXLAB FIGMA');
    assert.equal(listPhotosInput.reaction, 'none');
    assert.equal(listPhotosInput.status, 'ready');
    assert.equal(listPhotosInput.startDate, '2026-03-23');
    assert.equal(listPhotosInput.endDate, '2026-03-23');

    const exportResponse = await app.inject({
      method: 'GET',
      url:
        '/api/v1/admin/logs/export?startDate=2026-03-23&endDate=2026-03-23&startTime=08:00&endTime=12:00&action=auth.login.success',
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    assert.equal(exportResponse.statusCode, 200);
    assert.equal(exportResponse.headers['content-type'], 'text/csv; charset=utf-8');
    assert.match(exportResponse.headers['content-disposition'], /logs\.csv/);
    assert.equal(exportResponse.body, 'id,action\n1,auth.login.success');
    assert.ok(exportLogsInput);
    assert.equal(exportLogsInput.action, 'auth.login.success');
    assert.equal(exportLogsInput.startDate, '2026-03-23');
    assert.equal(exportLogsInput.endDate, '2026-03-23');
    assert.equal(exportLogsInput.startTime, '08:00');
    assert.equal(exportLogsInput.endTime, '12:00');
  } finally {
    await app.close();
  }
});
