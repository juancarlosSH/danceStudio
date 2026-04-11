import { Router } from 'express';
import {
  registerUserHandler,
  updatePasswordHandler,
  updatePaymentHandler,
  getClassesTakenHandler,
  getRemainingClassesHandler,
  getRemainingDaysHandler,
  getProfileHandler,
} from './usersController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  validateRegisterUser,
  validateUpdatePayment,
  validateId,
} from '../../middlewares/validateMiddleware';

const router = Router();

router.post('/',                     validateRegisterUser,                              registerUserHandler);
router.patch('/:id/password',        authMiddleware, validateId,                        updatePasswordHandler);
router.patch('/:id/payment',         authMiddleware, validateId, validateUpdatePayment, updatePaymentHandler);
router.get('/:id/classes-taken',     authMiddleware, validateId,                        getClassesTakenHandler);
router.get('/:id/classes-remaining', authMiddleware, validateId,                        getRemainingClassesHandler);
router.get('/:id/days-remaining',    authMiddleware, validateId,                        getRemainingDaysHandler);
router.get('/:id/profile',           authMiddleware, validateId,                        getProfileHandler);

export default router;