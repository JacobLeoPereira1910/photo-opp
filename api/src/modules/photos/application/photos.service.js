import { sanitizeEventConfigForClient } from '../../../config/event-config.js';

export class PhotosService {
  constructor({
    env,
    activeEventConfig,
    createPhotoUseCase,
    getPhotoByIdUseCase,
    getPhotoQrCodeUseCase,
    getPublicPhotoAccessUseCase,
    resolvePhotoDownloadUseCase,
    reactToPhotoUseCase
  }) {
    this.env = env;
    this.activeEventConfig = activeEventConfig;
    this.createPhotoUseCase = createPhotoUseCase;
    this.getPhotoByIdUseCase = getPhotoByIdUseCase;
    this.getPhotoQrCodeUseCase = getPhotoQrCodeUseCase;
    this.getPublicPhotoAccessUseCase = getPublicPhotoAccessUseCase;
    this.resolvePhotoDownloadUseCase = resolvePhotoDownloadUseCase;
    this.reactToPhotoUseCase = reactToPhotoUseCase;
  }

  async createPhoto(input) { return this.createPhotoUseCase.execute(input); }
  async getPhotoById(input) { return this.getPhotoByIdUseCase.execute(input); }
  async getPhotoQrCode(input) { return this.getPhotoQrCodeUseCase.execute(input); }
  async getPublicPhotoAccess(input) { return this.getPublicPhotoAccessUseCase.execute(input); }
  async resolveDownload(input) { return this.resolvePhotoDownloadUseCase.execute(input); }
  async reactToPhoto(input) { return this.reactToPhotoUseCase.execute(input); }
  async getActivationConfig() {
    return {
      event: sanitizeEventConfigForClient(this.activeEventConfig)
    };
  }

  async getStats({ photoRepository }) {
    const todayCount = await photoRepository.countToday(this.env.APP_TIMEZONE);
    return { todayPhotos: todayCount };
  }

  async getHistory({ promoterId, photoRepository }) {
    const photos = await photoRepository.findByPromoterRecent(promoterId, 6);
    return { photos };
  }
}
