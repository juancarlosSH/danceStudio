const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_TYPES = ["Bachata", "Salsa", "Cumbia"];

const validateRegisterUser = (req, res, next) => {
  const { name, password, paid_at, classes_paid } = req.body;
  if (!name || typeof name !== "string" || name.trim().length < 2)
    return res
      .status(400)
      .json({ message: "name must be at least 2 characters" });
  if (!password || typeof password !== "string" || password.length < 4)
    return res
      .status(400)
      .json({ message: "password must be at least 4 characters" });
  if (!paid_at || !DATE_REGEX.test(paid_at))
    return res
      .status(400)
      .json({ message: "paid_at must be a valid date YYYY-MM-DD" });
  if (classes_paid === undefined || ![0, 12, 15].includes(Number(classes_paid)))
    return res
      .status(400)
      .json({ message: "classes_paid must be 0, 12 or 15" });
  next();
};

const validateUpdatePayment = (req, res, next) => {
  const { paid_at, classes_paid } = req.body;
  if (!paid_at || !DATE_REGEX.test(paid_at))
    return res
      .status(400)
      .json({ message: "paid_at must be a valid date YYYY-MM-DD" });
  if (![12, 15].includes(Number(classes_paid)))
    return res.status(400).json({ message: "classes_paid must be 12 or 15" });
  next();
};

const validateRegisterClass = (req, res, next) => {
  const { type, class_date, user_id } = req.body;
  if (!VALID_TYPES.includes(type))
    return res
      .status(400)
      .json({ message: `type must be one of: ${VALID_TYPES.join(", ")}` });
  if (!class_date || !DATE_REGEX.test(class_date))
    return res
      .status(400)
      .json({ message: "class_date must be a valid date YYYY-MM-DD" });
  if (!user_id || isNaN(Number(user_id)))
    return res.status(400).json({ message: "user_id must be a valid number" });
  next();
};

const validateId = (req, res, next) => {
  const id = req.params.id || req.params.user_id;
  if (!id || isNaN(Number(id)))
    return res.status(400).json({ message: "id must be a valid number" });
  next();
};

module.exports = {
  validateRegisterUser,
  validateUpdatePayment,
  validateRegisterClass,
  validateId,
};
