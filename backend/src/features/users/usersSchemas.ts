import { z } from 'zod';

const dateRegex   = /^\d{4}-\d{2}-\d{2}$/;
const classesPaid = z.union([z.literal(12), z.literal(15)]);

export const registerUserSchema = z.object({
  name:         z.string().min(2, 'name must be at least 2 characters'),
  password:     z.string().min(4, 'password must be at least 4 characters'),
  paid_at:      z.string().regex(dateRegex, 'paid_at must be a valid date YYYY-MM-DD'),
  classes_paid: classesPaid.default(12),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(4, 'password must be at least 4 characters'),
});

export const updatePaymentSchema = z.object({
  paid_at:      z.string().regex(dateRegex, 'paid_at must be a valid date YYYY-MM-DD'),
  classes_paid: classesPaid,
});
