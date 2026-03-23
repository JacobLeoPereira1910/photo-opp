import { z } from 'zod';
import { LogAction } from '../../logs/domain/enums/log-action.enum.js';
import { PhotoStatus } from '../../photos/domain/enums/photo-status.enum.js';
import {
  dateRangeFiltersSchema,
  paginationSchema,
  photoIdParamsSchema
} from '../../../shared/utils/query-schemas.js';

export const adminMetricsQuerySchema = dateRangeFiltersSchema;

export const adminListPhotosQuerySchema = paginationSchema
  .merge(dateRangeFiltersSchema)
  .extend({
    query: z.string().trim().min(1).max(120).optional(),
    frameName: z.string().trim().min(1).max(40).optional(),
    reaction: z.enum(['liked', 'disliked', 'none']).optional(),
    status: z
      .enum([
        PhotoStatus.PROCESSING,
        PhotoStatus.READY,
        PhotoStatus.FAILED
      ])
      .optional()
  });

export const adminPhotoParamsSchema = photoIdParamsSchema;

export const adminListLogsQuerySchema = paginationSchema
  .merge(dateRangeFiltersSchema)
  .extend({
    action: z.enum(Object.values(LogAction)).optional()
  });

export const adminExportLogsQuerySchema = dateRangeFiltersSchema.extend({
  action: z.enum(Object.values(LogAction)).optional()
});
