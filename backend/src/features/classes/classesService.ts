import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { DanceClass, DanceType } from '../../types';

const VALID_TYPES: DanceType[] = ['Bachata', 'Salsa', 'Cumbia'];

export const registerClass = async (data: {
  type: DanceType;
  class_date: string;
  user_id: number;
}): Promise<DanceClass> => {
  if (!VALID_TYPES.includes(data.type)) {
    throw { status: 400, message: `type must be one of: ${VALID_TYPES.join(', ')}` };
  }

  const [user] = await sequelize.query<{ id: number }>(
    'SELECT id FROM users WHERE id = :user_id LIMIT 1',
    { replacements: { user_id: data.user_id }, type: QueryTypes.SELECT }
  );
  if (!user) throw { status: 404, message: 'User not found' };

  const [rows] = await sequelize.query(
    `INSERT INTO dance_classes (type, class_date, user_id)
     VALUES (:type, :class_date::date, :user_id)
     RETURNING id, type, TO_CHAR(class_date, 'YYYY-MM-DD') AS class_date, user_id, created_at`,
    {
      replacements: { type: data.type, class_date: data.class_date, user_id: data.user_id },
      type: QueryTypes.RAW,
    }
  );

  return (rows as DanceClass[])[0];
};

export const deleteClass = async (id: number): Promise<{ message: string }> => {
  const [existing] = await sequelize.query<{ id: number }>(
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

export const getClassesByUser = async (user_id: number): Promise<DanceClass[]> => {
  return sequelize.query<DanceClass>(
    `SELECT id, type, TO_CHAR(class_date, 'YYYY-MM-DD') AS class_date, user_id, created_at
     FROM dance_classes
     WHERE user_id = :user_id
     ORDER BY class_date DESC`,
    { replacements: { user_id }, type: QueryTypes.SELECT }
  );
};