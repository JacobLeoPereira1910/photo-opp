import { UserRole } from '../../users/domain/enums/user-role.enum.js';
import { LogAction } from '../../logs/domain/enums/log-action.enum.js';

export async function adminRoutes(app) {
  const adminController = app.diContainer.resolve('adminController');
  const adminAccess = app.authorize([UserRole.ADMIN]);

  app.get(
    '/admin/dashboard/metrics',
    {
      preHandler: [app.authenticate, adminAccess],
      config: {
        activityAction: LogAction.ADMIN_DASHBOARD_METRICS
      }
    },
    async (request, reply) => {
      return adminController.getDashboardMetrics.call(
        adminController,
        request,
        reply
      );
    }
  );

  app.get(
    '/admin/photos',
    {
      preHandler: [app.authenticate, adminAccess],
      config: {
        activityAction: LogAction.ADMIN_PHOTOS_LIST
      }
    },
    async (request, reply) => {
      return adminController.listPhotos.call(adminController, request, reply);
    }
  );

  app.get(
    '/admin/photos/:id',
    {
      preHandler: [app.authenticate, adminAccess],
      config: {
        activityAction: LogAction.ADMIN_PHOTO_VIEW
      }
    },
    async (request, reply) => {
      return adminController.getPhotoById.call(adminController, request, reply);
    }
  );

  app.get(
    '/admin/photos/:id/qrcode',
    {
      preHandler: [app.authenticate, adminAccess],
      config: {
        activityAction: LogAction.ADMIN_PHOTO_QRCODE
      }
    },
    async (request, reply) => {
      return adminController.getPhotoQrCode.call(
        adminController,
        request,
        reply
      );
    }
  );

  app.get(
    '/admin/logs',
    {
      preHandler: [app.authenticate, adminAccess],
      config: {
        activityAction: LogAction.ADMIN_LOGS_LIST
      }
    },
    async (request, reply) => {
      return adminController.listLogs.call(adminController, request, reply);
    }
  );

  app.get(
    '/admin/logs/export',
    {
      preHandler: [app.authenticate, adminAccess],
      config: {
        activityAction: LogAction.ADMIN_LOGS_EXPORT
      }
    },
    async (request, reply) => {
      return adminController.exportLogs.call(adminController, request, reply);
    }
  );
}
