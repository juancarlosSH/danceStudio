const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const sequelize = require("../../config/database");
require("dotenv").config();

const INVALID = { status: 401, message: "Invalid credentials" };

const login = async (name, password) => {
  const [user] = await sequelize.query(
    "SELECT * FROM users WHERE name = :name LIMIT 1",
    { replacements: { name }, type: QueryTypes.SELECT },
  );

  if (!user || !user.is_active) throw INVALID;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw INVALID;

  const token = jwt.sign(
    { id: user.id, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  return { token };
};

module.exports = { login };
