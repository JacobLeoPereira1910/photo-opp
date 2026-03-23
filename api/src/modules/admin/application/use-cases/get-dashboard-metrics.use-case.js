import { PhotoStatus } from '../../../photos/domain/enums/photo-status.enum.js';

export class GetDashboardMetricsUseCase {
  constructor({ env, photoRepository }) {
    this.env = env;
    this.photoRepository = photoRepository;
  }

  async execute({ filters }) {
    const [totalPhotos, filteredPhotos, groupedStatus, reactions, todayCount] =
      await Promise.all([
        this.photoRepository.count(),
        this.photoRepository.count(filters),
        this.photoRepository.countGroupedByStatus(filters),
        this.photoRepository.countGroupedByReaction(filters),
        this.photoRepository.countToday(this.env.APP_TIMEZONE)
      ]);

    const totalReacted = reactions.total;
    const likedPct = totalReacted > 0
      ? Math.round((reactions.liked / totalReacted) * 100)
      : null;
    const dislikedPct = totalReacted > 0
      ? Math.round((reactions.disliked / totalReacted) * 100)
      : null;

    return {
      totalPhotos,
      filteredPhotos,
      todayPhotos: todayCount,
      statusBreakdown: {
        [PhotoStatus.PROCESSING]: groupedStatus[PhotoStatus.PROCESSING] || 0,
        [PhotoStatus.READY]:      groupedStatus[PhotoStatus.READY]      || 0,
        [PhotoStatus.FAILED]:     groupedStatus[PhotoStatus.FAILED]     || 0
      },
      reactions: {
        liked:      reactions.liked,
        disliked:   reactions.disliked,
        total:      totalReacted,
        likedPct,
        dislikedPct
      }
    };
  }
}
