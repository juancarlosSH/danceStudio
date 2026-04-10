const { Router } = require("express");
const classesController = require("./classes.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = Router();

router.post("/", authMiddleware, classesController.registerClass);
router.get(
  "/user/:user_id",
  authMiddleware,
  classesController.getClassesByUser,
);
router.delete("/:id", authMiddleware, classesController.deleteClass);

module.exports = router;
