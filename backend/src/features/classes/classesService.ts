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

  // We no longer verify that the user exists before inserting: user_id comes
  // from a JWT we just verified, and users cannot delete themselves. The DB
  // foreign key will raise if the user somehow vanished, which is acceptable.

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

/**
 * Deletes a class only if it belongs to `userId`.
 *
 * Implementation note: the DELETE carries the ownership check in its WHERE
 * clause and uses PostgreSQL's RETURNING to report which rows it actually
 * removed. This is atomic (no SELECT-then-DELETE race) and does not
 * distinguish between "class does not exist" and "class exists but is not
 * yours" — both return 404. That is intentional: returning 403 for the
 * second case would leak the existence of class ids belonging to other users.
 *
 * Why RETURNING rather than affected-row count: Sequelize's affected-row
 * metadata for raw queries is dialect-specific and historically flaky;
 * RETURNING is native Postgres and gives us a typed, unambiguous result.
 */
export const deleteClassForUser = async (
  classId: number,
  userId: number
): Promise<{ message: string }> => {
  const deleted = await sequelize.query<{ id: number }>(
    'DELETE FROM dance_classes WHERE id = :id AND user_id = :user_id RETURNING id',
    { replacements: { id: classId, user_id: userId }, type: QueryTypes.SELECT }
  );

  if (deleted.length === 0) throw { status: 404, message: 'Class not found' };

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