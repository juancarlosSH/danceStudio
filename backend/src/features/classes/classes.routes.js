const { Router } = require("express");
const classesController = require("./classes.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const {
  validateRegisterClass,
  validateId,
} = require("../../middlewares/validate.middleware");

const router = Router();

router.post(
  "/",
  authMiddleware,
  validateRegisterClass,
  classesController.registerClass,
);
router.get(
  "/user/:user_id",
  authMiddleware,
  validateId,
  classesController.getClassesByUser,
);
router.delete(
  "/:id",
  authMiddleware,
  validateId,
  classesController.deleteClass,
);

module.exports = router;
