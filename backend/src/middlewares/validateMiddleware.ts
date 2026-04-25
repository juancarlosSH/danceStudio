import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny, target: 'body' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      res.status(400).json({ errors: result.error.issues });
      return;
    }
    (req as any)[target] = result.data;
    next();
  };
