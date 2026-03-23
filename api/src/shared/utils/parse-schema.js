import { ZodError } from 'zod';
import { BadRequestError } from '../../errors/app-error.js';

export function parseSchema(schema, input) {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      throw new BadRequestError(firstIssue?.message || 'Dados invalidos', {
        details: error.issues
      });
    }

    throw error;
  }
}
