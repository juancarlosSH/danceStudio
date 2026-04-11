import { Router } from 'express';
import { registerClassHandler, deleteClassHandler, getClassesByUserHandler } from './classesController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateRegisterClass, validateId } from '../../middlewares/validateMiddleware';

const router = Router();

router.post('/',             authMiddleware, validateRegisterClass, registerClassHandler);
router.get('/user/:user_id', authMiddleware, validateId,            getClassesByUserHandler);
router.delete('/:id',        authMiddleware, validateId,            deleteClassHandler);

export default router;