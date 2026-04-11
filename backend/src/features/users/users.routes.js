const { Router } = require("express");
const usersController = require("./users.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const {
  validateRegisterUser,
  validateUpdatePayment,
  validateId,
} = require("../../middlewares/validate.middleware");

const router = Router();

router.post("/", validateRegisterUser, usersController.registerUser);
router.patch(
  "/:id/password",
  authMiddleware,
  validateId,
  usersController.updatePassword,
);
router.patch(
  "/:id/payment",
  authMiddleware,
  validateId,
  validateUpdatePayment,
  usersController.updatePayment,
);
router.get(
  "/:id/classes-taken",
  authMiddleware,
  validateId,
  usersController.getClassesTaken,
);
router.get(
  "/:id/classes-remaining",
  authMiddleware,
  validateId,
  usersController.getRemainingClasses,
);
router.get(
  "/:id/days-remaining",
  authMiddleware,
  validateId,
  usersController.getRemainingDays,
);
router.get(
  "/:id/profile",
  authMiddleware,
  validateId,
  usersController.getProfile,
);

module.exports = router;
