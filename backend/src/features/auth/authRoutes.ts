import { Router } from 'express';
import { loginHandler } from './authController';
import { loginLimiter } from '../../middlewares/rateLimitMiddleware';
import { validate } from '../../middlewares/validateMiddleware';
import { loginSchema } from './authSchemas';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), loginHandler);

export default router;
