const { Router } = require('express');
const usersController = require('./users.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

router.post('/', usersController.registerUser);
router.patch('/:id/password', authMiddleware, usersController.updatePassword);
router.patch('/:id/payment', authMiddleware, usersController.updatePayment);
router.get('/:id/classes-taken', authMiddleware, usersController.getClassesTaken);
router.get('/:id/classes-remaining', authMiddleware, usersController.getRemainingClasses);
router.get('/:id/days-remaining', authMiddleware, usersController.getRemainingDays);

module.exports = router;
