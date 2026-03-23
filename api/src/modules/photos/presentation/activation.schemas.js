import { z } from 'zod';
import { UserRole } from '../../users/domain/enums/user-role.enum.js';
import { PhotoReaction } from '../domain/enums/photo-reaction.enum.js';
import { photoIdParamsSchema } from '../../../shared/utils/query-schemas.js';

export const requesterSchema = z.object({
  id: z.string().min(1, 'Usuario autenticado invalido'),
  role: z.enum([UserRole.ADMIN, UserRole.PROMOTER])
});

export const createPhotoSchema = z.object({
  promoterId: z.string().min(1, 'Usuario autenticado invalido'),
  frameName: z.string().trim().min(1).max(40).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  file: z.object({
    buffer: z.instanceof(Buffer),
    filename: z.string().min(1, 'Nome do arquivo obrigatorio'),
    mimetype: z
      .string()
      .min(1, 'Tipo do arquivo obrigatorio')
      .refine((value) => value.startsWith('image/'), {
        message: 'Apenas imagens sao aceitas'
      }),
    size: z.number().positive('Arquivo invalido')
  })
});

export const activationPhotoParamsSchema = photoIdParamsSchema.extend({
  requester: requesterSchema
});

export const reactToPhotoSchema = z.object({
  id: z.string().min(1, 'ID da foto obrigatorio'),
  reaction: z.enum([PhotoReaction.LIKED, PhotoReaction.DISLIKED], {
    required_error: 'Reacao obrigatoria',
    invalid_type_error: 'Reacao invalida'
  })
});
