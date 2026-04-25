import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const registerClassSchema = z.object({
  type:       z.enum(['Bachata', 'Salsa', 'Cumbia']),
  class_date: z.string().regex(dateRegex, 'class_date must be a valid date YYYY-MM-DD'),
});

export const classIdParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
});
