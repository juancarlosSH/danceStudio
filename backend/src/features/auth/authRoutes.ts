import { Router } from 'express';
import { loginHandler } from './authController';
import { loginLimiter } from '../../middlewares/rateLimitMiddleware';

const router = Router();

router.post('/login', loginLimiter, loginHandler);

export default router;