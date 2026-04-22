import { Router } from 'express';
import { registerClassHandler, deleteClassHandler, getMyClassesHandler } from './classesController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateRegisterClass, validateId } from '../../middlewares/validateMiddleware';

/**
 * Classes are always scoped to the authenticated user:
 *   - POST /classes         -> user_id is taken from req.user.id (not body)
 *   - GET  /classes/mine    -> lists classes of the authenticated user
 *   - DELETE /classes/:id   -> requires the class to belong to req.user.id
 *
 * Previously:
 *   - POST /classes took user_id from the body (IDOR: anyone could log a
 *     class against another user's account, consuming their quota).
 *   - GET /classes/user/:user_id trusted the URL parameter.
 *   - DELETE /classes/:id never verified ownership at all, so any
 *     authenticated user could delete any other user's classes.
 *
 * See ADR-001 in docs/DECISIONS.md.
 */
const router = Router();

router.post('/',       authMiddleware, validateRegisterClass, registerClassHandler);
router.get('/mine',    authMiddleware,                        getMyClassesHandler);
router.delete('/:id',  authMiddleware, validateId,            deleteClassHandler);

export default router;