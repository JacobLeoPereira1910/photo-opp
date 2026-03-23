import fp from 'fastify-plugin';
import { asClass, asValue } from 'awilix';
import { fastifyAwilixPlugin } from '@fastify/awilix';
import { env } from '../config/env.js';
import { getActiveEventConfig } from '../config/event-config.js';
import { PrismaDatabaseClient } from '../infra/database/prisma.client.js';
import { BcryptHashProvider } from '../infra/providers/hash/bcrypt-hash.provider.js';
import { JwtTokenProvider } from '../infra/providers/token/jwt-token.provider.js';
import { LocalStorageProvider } from '../infra/providers/storage/local-storage.provider.js';
import { NodeQrCodeProvider } from '../infra/providers/qrcode/qrcode.provider.js';
import { SharpImageFrameProvider } from '../infra/providers/image/sharp-image-frame.provider.js';
import { PrismaUserRepository } from '../modules/users/infra/prisma-user.repository.js';
import { PrismaPhotoRepository } from '../modules/photos/infra/prisma-photo.repository.js';
import { PrismaLogRepository } from '../modules/logs/infra/prisma-log.repository.js';
import { GetUserByIdUseCase } from '../modules/users/application/use-cases/get-user-by-id.use-case.js';
import { LoginUseCase } from '../modules/auth/application/use-cases/login.use-case.js';
import { GetAuthenticatedUserUseCase } from '../modules/auth/application/use-cases/get-authenticated-user.use-case.js';
import { RequestPasswordResetUseCase } from '../modules/auth/application/use-cases/request-password-reset.use-case.js';
import { VerifyOtpUseCase } from '../modules/auth/application/use-cases/verify-otp.use-case.js';
import { ResetPasswordUseCase } from '../modules/auth/application/use-cases/reset-password.use-case.js';
import { PrismaPasswordResetTokenRepository } from '../modules/auth/infra/prisma-password-reset-token.repository.js';
import { CreatePhotoUseCase } from '../modules/photos/application/use-cases/create-photo.use-case.js';
import { GetPhotoByIdUseCase } from '../modules/photos/application/use-cases/get-photo-by-id.use-case.js';
import { GetPhotoQrCodeUseCase } from '../modules/photos/application/use-cases/get-photo-qrcode.use-case.js';
import { GetPublicPhotoAccessUseCase } from '../modules/photos/application/use-cases/get-public-photo-access.use-case.js';
import { ResolvePhotoDownloadUseCase } from '../modules/photos/application/use-cases/resolve-photo-download.use-case.js';
import { ListPhotosUseCase } from '../modules/photos/application/use-cases/list-photos.use-case.js';
import { ReactToPhotoUseCase } from '../modules/photos/application/use-cases/react-to-photo.use-case.js';
import { RegisterActivityLogUseCase } from '../modules/logs/application/use-cases/register-activity-log.use-case.js';
import { ListLogsUseCase } from '../modules/logs/application/use-cases/list-logs.use-case.js';
import { ExportLogsUseCase } from '../modules/logs/application/use-cases/export-logs.use-case.js';
import { GetDashboardMetricsUseCase } from '../modules/admin/application/use-cases/get-dashboard-metrics.use-case.js';
import { AdminListPhotosUseCase } from '../modules/admin/application/use-cases/admin-list-photos.use-case.js';
import { AdminGetPhotoUseCase } from '../modules/admin/application/use-cases/admin-get-photo.use-case.js';
import { AdminGetPhotoQrCodeUseCase } from '../modules/admin/application/use-cases/admin-get-photo-qrcode.use-case.js';
import { AdminListLogsUseCase } from '../modules/admin/application/use-cases/admin-list-logs.use-case.js';
import { AdminExportLogsUseCase } from '../modules/admin/application/use-cases/admin-export-logs.use-case.js';
import { AuthService } from '../modules/auth/application/auth.service.js';
import { PhotosService } from '../modules/photos/application/photos.service.js';
import { ActivityLoggerService } from '../modules/logs/application/activity-logger.service.js';
import { AdminService } from '../modules/admin/application/admin.service.js';
import { AuthController } from '../modules/auth/presentation/auth.controller.js';
import { ActivationController } from '../modules/photos/presentation/activation.controller.js';
import { AdminController } from '../modules/admin/presentation/admin.controller.js';

async function diPlugin(app, options = {}) {
  await app.register(fastifyAwilixPlugin, {
    disposeOnClose: true
  });

  app.diContainer.register({
    env: asValue(env),
    activeEventConfig: asValue(getActiveEventConfig()),
    jwt: asValue(app.jwt),

    prismaClient: asClass(PrismaDatabaseClient)
      .singleton()
      .disposer((client) => client.close()),

    hashProvider: asClass(BcryptHashProvider).singleton(),
    tokenProvider: asClass(JwtTokenProvider).singleton(),
    storageProvider: asClass(LocalStorageProvider).singleton(),
    qrCodeProvider: asClass(NodeQrCodeProvider).singleton(),
    imageFrameProvider: asClass(SharpImageFrameProvider).singleton(),

    userRepository: asClass(PrismaUserRepository).singleton(),
    photoRepository: asClass(PrismaPhotoRepository).singleton(),
    logRepository: asClass(PrismaLogRepository).singleton(),
    passwordResetTokenRepository: asClass(PrismaPasswordResetTokenRepository).singleton(),

    getUserByIdUseCase: asClass(GetUserByIdUseCase).singleton(),
    loginUseCase: asClass(LoginUseCase).singleton(),
    getAuthenticatedUserUseCase: asClass(GetAuthenticatedUserUseCase).singleton(),
    requestPasswordResetUseCase: asClass(RequestPasswordResetUseCase).singleton(),
    verifyOtpUseCase: asClass(VerifyOtpUseCase).singleton(),
    resetPasswordUseCase: asClass(ResetPasswordUseCase).singleton(),
    createPhotoUseCase: asClass(CreatePhotoUseCase).singleton(),
    getPhotoByIdUseCase: asClass(GetPhotoByIdUseCase).singleton(),
    getPhotoQrCodeUseCase: asClass(GetPhotoQrCodeUseCase).singleton(),
    getPublicPhotoAccessUseCase: asClass(GetPublicPhotoAccessUseCase).singleton(),
    resolvePhotoDownloadUseCase: asClass(ResolvePhotoDownloadUseCase).singleton(),
    listPhotosUseCase: asClass(ListPhotosUseCase).singleton(),
    reactToPhotoUseCase: asClass(ReactToPhotoUseCase).singleton(),
    registerActivityLogUseCase: asClass(RegisterActivityLogUseCase).singleton(),
    listLogsUseCase: asClass(ListLogsUseCase).singleton(),
    exportLogsUseCase: asClass(ExportLogsUseCase).singleton(),
    getDashboardMetricsUseCase: asClass(GetDashboardMetricsUseCase).singleton(),
    adminListPhotosUseCase: asClass(AdminListPhotosUseCase).singleton(),
    adminGetPhotoUseCase: asClass(AdminGetPhotoUseCase).singleton(),
    adminGetPhotoQrCodeUseCase: asClass(AdminGetPhotoQrCodeUseCase).singleton(),
    adminListLogsUseCase: asClass(AdminListLogsUseCase).singleton(),
    adminExportLogsUseCase: asClass(AdminExportLogsUseCase).singleton(),

    authService: asClass(AuthService).singleton(),
    photosService: asClass(PhotosService).singleton(),
    activityLoggerService: asClass(ActivityLoggerService).singleton(),
    adminService: asClass(AdminService).singleton(),

    authController: asClass(AuthController).singleton(),
    activationController: asClass(ActivationController).singleton(),
    adminController: asClass(AdminController).singleton()
  });

  if (options.diOverrides) {
    app.diContainer.register(options.diOverrides);
  }
}

export default fp(diPlugin);
