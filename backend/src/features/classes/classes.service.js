const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');

const VALID_TYPES = ['Bachata', 'Salsa', 'Cumbia'];

const registerClass = async ({ type, class_date, user_id }) => {
  if (!VALID_TYPES.includes(type)) {
    throw { status: 400, message: `type must be one of: ${VALID_TYPES.join(', ')}` };
  }

  const [user] = await sequelize.query(
    'SELECT id FROM users WHERE id = :user_id LIMIT 1',
    { replacements: { user_id }, type: QueryTypes.SELECT }
  );
  if (!user) throw { status: 404, message: 'User not found' };

  const [result] = await sequelize.query(
    `INSERT INTO dance_classes (type, class_date, user_id)
     VALUES (:type, :class_date, :user_id)
     RETURNING *`,
    {
      replacements: { type, class_date, user_id },
      type: QueryTypes.INSERT,
    }
  );

  return result[0];
};

const deleteClass = async (id) => {
  const [existing] = await sequelize.query(
    'SELECT id FROM dance_classes WHERE id = :id LIMIT 1',
    { replacements: { id }, type: QueryTypes.SELECT }
  );
  if (!existing) throw { status: 404, message: 'Class not found' };

  await sequelize.query(
    'DELETE FROM dance_classes WHERE id = :id',
    { replacements: { id }, type: QueryTypes.DELETE }
  );

  return { message: 'Class deleted' };
};

const getClassesByUser = async (user_id) => {
  const classes = await sequelize.query(
    `SELECT * FROM dance_classes WHERE user_id = :user_id ORDER BY class_date DESC`,
    { replacements: { user_id }, type: QueryTypes.SELECT }
  );
  return classes;
};

module.exports = { registerClass, deleteClass, getClassesByUser };
