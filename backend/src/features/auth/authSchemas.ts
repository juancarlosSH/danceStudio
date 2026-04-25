import { z } from 'zod';

export const loginSchema = z.object({
  name:     z.string().min(2, 'name must be at least 2 characters'),
  password: z.string().min(4, 'password must be at least 4 characters'),
});
