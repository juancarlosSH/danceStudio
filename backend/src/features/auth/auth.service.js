const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');
require('dotenv').config();

const login = async (name, password) => {
  const [user] = await sequelize.query(
    'SELECT * FROM users WHERE name = :name LIMIT 1',
    { replacements: { name }, type: QueryTypes.SELECT }
  );

  if (!user) throw { status: 404, message: 'User not found' };
  if (!user.is_active) throw { status: 403, message: 'Account is not active' };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 401, message: 'Invalid credentials' };

  const token = jwt.sign(
    { id: user.id, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token };
};

module.exports = { login };
