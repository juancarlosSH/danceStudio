const bcrypt = require("bcryptjs");
const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/database");

const registerUser = async ({ name, password, paid_at, classes_paid }) => {
  const [existing] = await sequelize.query(
    "SELECT id FROM users WHERE name = :name LIMIT 1",
    { replacements: { name }, type: QueryTypes.SELECT },
  );
  if (existing) throw { status: 409, message: "Username already exists" };

  const hashed = await bcrypt.hash(password, 10);

  const [user] = await sequelize.query(
    `INSERT INTO users (name, password, paid_at, classes_paid)
     VALUES (:name, :password, :paid_at, :classes_paid)
     RETURNING id, name, paid_at, classes_paid, is_active, created_at`,
    {
      replacements: { name, password: hashed, paid_at, classes_paid },
      type: QueryTypes.INSERT,
    },
  );

  return user[0];
};

const updatePassword = async (id, newPassword) => {
  const hashed = await bcrypt.hash(newPassword, 10);
  await sequelize.query(
    "UPDATE users SET password = :password, is_active = false WHERE id = :id",
    { replacements: { password: hashed, id }, type: QueryTypes.UPDATE },
  );
  return {
    message: "Password updated. Account deactivated until re-activation.",
  };
};

const updatePayment = async (id, { paid_at, classes_paid }) => {
  await sequelize.query(
    "UPDATE users SET paid_at = :paid_at, classes_paid = :classes_paid WHERE id = :id",
    { replacements: { paid_at, classes_paid, id }, type: QueryTypes.UPDATE },
  );
  return { message: "Payment info updated" };
};

const getClassesTaken = async (id) => {
  const [user] = await sequelize.query(
    "SELECT paid_at FROM users WHERE id = :id LIMIT 1",
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!user) throw { status: 404, message: "User not found" };

  const [result] = await sequelize.query(
    `SELECT COUNT(*) AS count FROM dance_classes
     WHERE user_id = :id AND class_date >= :paid_at`,
    { replacements: { id, paid_at: user.paid_at }, type: QueryTypes.SELECT },
  );

  return { classes_taken: parseInt(result.count) };
};

const getRemainingClasses = async (id) => {
  const [user] = await sequelize.query(
    "SELECT paid_at, classes_paid FROM users WHERE id = :id LIMIT 1",
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!user) throw { status: 404, message: "User not found" };

  const [result] = await sequelize.query(
    `SELECT COUNT(*) AS count FROM dance_classes
     WHERE user_id = :id AND class_date >= :paid_at`,
    { replacements: { id, paid_at: user.paid_at }, type: QueryTypes.SELECT },
  );

  const taken = parseInt(result.count);
  const remaining = user.classes_paid - taken;

  return {
    classes_paid: user.classes_paid,
    classes_taken: taken,
    classes_remaining: remaining,
  };
};

const getRemainingDays = async (id) => {
  const [user] = await sequelize.query(
    "SELECT paid_at FROM users WHERE id = :id LIMIT 1",
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!user) throw { status: 404, message: "User not found" };

  const paidAt = new Date(user.paid_at);
  const nextPayment = new Date(paidAt);
  nextPayment.setMonth(nextPayment.getMonth() + 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = Math.ceil((nextPayment - today) / (1000 * 60 * 60 * 24));

  return {
    next_payment_date: nextPayment.toISOString().split("T")[0],
    days_remaining: diff,
  };
};

const getProfile = async (id) => {
  const [user] = await sequelize.query(
    "SELECT id, name, paid_at, classes_paid FROM users WHERE id = :id LIMIT 1",
    { replacements: { id }, type: QueryTypes.SELECT },
  );
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};

module.exports = {
  registerUser,
  updatePassword,
  updatePayment,
  getClassesTaken,
  getRemainingClasses,
  getRemainingDays,
  getProfile,
};
