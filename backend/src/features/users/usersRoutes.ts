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
import { validateRegisterUser, validateUpdatePayment } from '../../middlewares/validateMiddleware';

/**
 * Routes for the authenticated user operate on /me/*, not /:id/*.
 *
 * Rationale: the previous /:id/* scheme required every handler to remember to
 * compare req.user.id against req.params.id. Forgetting that check opened
 * IDOR holes across the whole user surface. With /me/*, the handler reads
 * req.user.id directly and there is no client-supplied id to tamper with.
 *
 * Admin-only endpoints that operate on arbitrary users (e.g. account
 * activation) will live under a separate, role-gated surface when the admin
 * panel lands (Prioridad Alta, punto 5). They do not go here.
 *
 * See ADR-001 in docs/DECISIONS.md.
 */
const router = Router();

// Public: create an account.
router.post('/', validateRegisterUser, registerUserHandler);

// Authenticated: operate on "me".
router.patch('/me/password',         authMiddleware,                        updatePasswordHandler);
router.patch('/me/payment',          authMiddleware, validateUpdatePayment, updatePaymentHandler);
router.get('/me/classes-taken',      authMiddleware,                        getClassesTakenHandler);
router.get('/me/classes-remaining',  authMiddleware,                        getRemainingClassesHandler);
router.get('/me/days-remaining',     authMiddleware,                        getRemainingDaysHandler);
router.get('/me/profile',            authMiddleware,                        getProfileHandler);

export default router;