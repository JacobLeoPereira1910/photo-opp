import { UserRole } from '../../users/domain/enums/user-role.enum.js';
import { LogAction } from '../../logs/domain/enums/log-action.enum.js';

export async function activationRoutes(app) {
  const activationController = app.diContainer.resolve('activationController');
  const activationAccess = app.authorize([UserRole.ADMIN, UserRole.PROMOTER]);

  app.get('/activation/config', { config: { skipActivityLog: true } }, async (request, reply) => {
    return activationController.getConfig.call(activationController, request, reply);
  });

  // Contador público de fotos do dia (sem auth) — usado no welcome
  app.get('/activation/stats', { config: { skipActivityLog: true } }, async (request, reply) => {
    return activationController.getStats.call(activationController, request, reply);
  });

  app.post(
    '/activation/photos',
    {
      preHandler: [app.authenticate, activationAccess],
      config: {
        activityAction: LogAction.ACTIVATION_PHOTO_CREATE
      }
    },
    async (request, reply) => {
      return activationController.createPhoto.call(
        activationController,
        request,
        reply
      );
    }
  );

  app.get(
    '/activation/photos/:id',
    {
      preHandler: [app.authenticate, activationAccess],
      config: {
        activityAction: LogAction.ACTIVATION_PHOTO_VIEW
      }
    },
    async (request, reply) => {
      return activationController.getPhotoById.call(
        activationController,
        request,
        reply
      );
    }
  );

  app.get(
    '/activation/photos/:id/access',
    {
      config: {
        skipActivityLog: true
      }
    },
    async (request, reply) => {
      return activationController.accessPhoto.call(activationController, request, reply);
    }
  );

  app.get(
    '/activation/photos/:id/download',
    {
      config: {
        activityAction: LogAction.ACTIVATION_PHOTO_DOWNLOAD
      }
    },
    async (request, reply) => {
      return activationController.downloadPhoto.call(
        activationController,
        request,
        reply
      );
    }
  );

  app.get(
    '/activation/photos/:id/qrcode',
    {
      preHandler: [app.authenticate, activationAccess],
      config: {
        activityAction: LogAction.ACTIVATION_PHOTO_QRCODE
      }
    },
    async (request, reply) => {
      return activationController.getPhotoQrCode.call(
        activationController,
        request,
        reply
      );
    }
  );

  app.patch(
    '/activation/photos/:id/reaction',
    {
      preHandler: [app.authenticate, activationAccess],
      config: {
        activityAction: LogAction.ACTIVATION_PHOTO_REACTION
      }
    },
    async (request, reply) => {
      return activationController.reactToPhoto.call(
        activationController,
        request,
        reply
      );
    }
  );

  app.get(
    '/activation/photos/history',
    {
      preHandler: [app.authenticate, activationAccess],
      config: {
        activityAction: LogAction.ACTIVATION_PHOTOS_HISTORY
      }
    },
    async (request, reply) => {
      return activationController.getHistory.call(
        activationController,
        request,
        reply
      );
    }
  );
}
