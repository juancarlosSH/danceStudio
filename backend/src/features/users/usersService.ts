import bcrypt from 'bcryptjs';
import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { User } from '../../types';

interface ProfileRow {
  id: number;
  name: string;
  paid_at: string;
  classes_paid: number;
}

interface CountRow {
  count: string;
}

interface DaysRow {
  paid_at: string;
  days_remaining: string;
  next_payment_date: string;
}

export const registerUser = async (data: {
  name: string;
  password: string;
  paid_at: string;
  classes_paid: number;
}): Promise<Partial<User>> => {
  const [existing] = await sequelize.query<User>(
    'SELECT id FROM users WHERE name = :name LIMIT 1',
    { replacements: { name: data.name }, type: QueryTypes.SELECT }
  );
  if (existing) throw { status: 409, message: 'Username already exists' };

  const hashed = await bcrypt.hash(data.password, 10);

  const [rows] = await sequelize.query(
    `INSERT INTO users (name, password, paid_at, classes_paid)
     VALUES (:name, :password, :paid_at::date, :classes_paid)
     RETURNING id, name, TO_CHAR(paid_at, 'YYYY-MM-DD') AS paid_at, classes_paid, is_active, created_at`,
    {
      replacements: { name: data.name, password: hashed, paid_at: data.paid_at, classes_paid: data.classes_paid },
      type: QueryTypes.RAW,
    }
  );

  return (rows as Partial<User>[])[0];
};

export const updatePassword = async (id: number, newPassword: string): Promise<{ message: string }> => {
  const hashed = await bcrypt.hash(newPassword, 10);
  await sequelize.query(
    'UPDATE users SET password = :password, is_active = false WHERE id = :id',
    { replacements: { password: hashed, id }, type: QueryTypes.UPDATE }
  );
  return { message: 'Password updated. Account deactivated until re-activation.' };
};

export const updatePayment = async (id: number, paid_at: string, classes_paid: number): Promise<{ message: string }> => {
  await sequelize.query(
    'UPDATE users SET paid_at = :paid_at::date, classes_paid = :classes_paid WHERE id = :id',
    { replacements: { paid_at, classes_paid, id }, type: QueryTypes.UPDATE }
  );
  return { message: 'Payment info updated' };
};

export const getClassesTaken = async (id: number): Promise<{ classes_taken: number }> => {
  const [user] = await sequelize.query<{ paid_at: string }>(
    `SELECT TO_CHAR(paid_at, 'YYYY-MM-DD') AS paid_at FROM users WHERE id = :id LIMIT 1`,
    { replacements: { id }, type: QueryTypes.SELECT }
  );
  if (!user) throw { status: 404, message: 'User not found' };

  const [result] = await sequelize.query<CountRow>(
    `SELECT COUNT(*) AS count FROM dance_classes
     WHERE user_id = :id AND class_date >= :paid_at::date`,
    { replacements: { id, paid_at: user.paid_at }, type: QueryTypes.SELECT }
  );

  return { classes_taken: parseInt(result.count) };
};

export const getRemainingClasses = async (id: number): Promise<{
  classes_paid: number;
  classes_taken: number;
  classes_remaining: number;
}> => {
  const [user] = await sequelize.query<{ paid_at: string; classes_paid: number }>(
    `SELECT TO_CHAR(paid_at, 'YYYY-MM-DD') AS paid_at, classes_paid FROM users WHERE id = :id LIMIT 1`,
    { replacements: { id }, type: QueryTypes.SELECT }
  );
  if (!user) throw { status: 404, message: 'User not found' };

  const [result] = await sequelize.query<CountRow>(
    `SELECT COUNT(*) AS count FROM dance_classes
     WHERE user_id = :id AND class_date >= :paid_at::date`,
    { replacements: { id, paid_at: user.paid_at }, type: QueryTypes.SELECT }
  );

  const taken     = parseInt(result.count);
  const remaining = user.classes_paid - taken;

  return { classes_paid: user.classes_paid, classes_taken: taken, classes_remaining: remaining };
};

export const getRemainingDays = async (id: number): Promise<{
  next_payment_date: string;
  days_remaining: number;
}> => {
  const [result] = await sequelize.query<DaysRow>(
    `SELECT
       TO_CHAR(paid_at, 'YYYY-MM-DD') AS paid_at,
       (paid_at + INTERVAL '1 month')::date - CURRENT_DATE AS days_remaining,
       TO_CHAR(paid_at + INTERVAL '1 month', 'YYYY-MM-DD') AS next_payment_date
     FROM users
     WHERE id = :id
     LIMIT 1`,
    { replacements: { id }, type: QueryTypes.SELECT }
  );
  if (!result) throw { status: 404, message: 'User not found' };

  return {
    next_payment_date: result.next_payment_date,
    days_remaining:    parseInt(result.days_remaining),
  };
};

export const getProfile = async (id: number): Promise<ProfileRow> => {
  const [user] = await sequelize.query<ProfileRow>(
    `SELECT id, name, TO_CHAR(paid_at, 'YYYY-MM-DD') AS paid_at, classes_paid
     FROM users WHERE id = :id LIMIT 1`,
    { replacements: { id }, type: QueryTypes.SELECT }
  );
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
};