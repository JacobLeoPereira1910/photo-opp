import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export const dateRangeFiltersSchema = z
  .object({
    startDate: z.string().regex(dateRegex, 'Data inicial invalida').optional(),
    endDate: z.string().regex(dateRegex, 'Data final invalida').optional(),
    startTime: z.string().regex(timeRegex, 'Hora inicial invalida').optional(),
    endTime: z.string().regex(timeRegex, 'Hora final invalida').optional()
  })
  .superRefine((value, context) => {
    const hasTime = Boolean(value.startTime || value.endTime);
    const hasDate = Boolean(value.startDate || value.endDate);

    if (hasTime && !hasDate) {
      context.addIssue({
        code: 'custom',
        message: 'Informe ao menos uma data ao filtrar por hora',
        path: ['startDate']
      });
    }
  });

export const photoIdParamsSchema = z.object({
  id: z.string({ required_error: 'ID da foto obrigatorio' }).min(1, 'ID da foto obrigatorio')
});
