import { asValue } from 'awilix';

process.env.DATABASE_URL ||= 'postgresql://postgres:postgres@localhost:5432/photo_opp?schema=public';
process.env.JWT_SECRET ||= 'test-secret';

function createDefaultOverrides(customOverrides = {}) {
  return {
    authService: asValue({
      async login() {
        return {
          accessToken: 'fake-token',
          tokenType: 'Bearer',
          expiresIn: '8h',
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin'
          }
        };
      },
      async getMe() {
        return {
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin'
          }
        };
      }
    }),
    photosService: asValue({
      async createPhoto() {
        return { photo: { id: 'photo-1' } };
      },
      async getActivationConfig() {
        return {
          event: {
            key: 'nexlab-default'
          }
        };
      },
      async getPhotoById() {
        return { photo: { id: 'photo-1' } };
      },
      async getPhotoQrCode() {
        return {
          photoId: 'photo-1',
          qrCodeUrl: 'http://localhost:3333/storage/qrcodes/photo-1.png',
          qrCodeValue: 'http://localhost:3333/api/v1/activation/photos/photo-1/download',
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
        return {
          photo: {
            id: 'photo-1',
            reaction: 'liked'
          }
        };
      },
      async getStats() {
        return { todayPhotos: 1 };
      },
      async getHistory() {
        return { photos: [] };
      }
    }),
    adminService: asValue({
      async getDashboardMetrics() {
        return {
          totalPhotos: 10,
          filteredPhotos: 5,
          statusBreakdown: {
            processing: 1,
            ready: 4,
            failed: 0
          }
        };
      },
      async listPhotos() {
        return {
          page: 1,
          limit: 10,
          total: 0,
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
          qrCodeUrl: 'http://localhost:3333/storage/qrcodes/photo-1.png',
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
      async exportLogs() {
        return {
          fileName: 'logs.csv',
          csv: 'id,action\n1,test',
          total: 1
        };
      }
    }),
    activityLoggerService: asValue({
      async logHttpRequest() {}
    }),
    ...customOverrides
  };
}

export async function buildTestApp(customOverrides = {}) {
  const { buildApp } = await import('../../src/app.js');

  return buildApp({
    logger: false,
    diOverrides: createDefaultOverrides(customOverrides)
  });
}
