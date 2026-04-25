import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import { User } from '../../types';
import dotenv from 'dotenv';

dotenv.config();

const INVALID = { status: 401, message: 'Invalid credentials' };

export const login = async (
  name: string,
  password: string,
): Promise<{ token: string; user: { id: number; name: string }; expiresAt: number }> => {
  const [user] = await sequelize.query<User>(
    'SELECT * FROM users WHERE name = :name LIMIT 1',
    { replacements: { name }, type: QueryTypes.SELECT }
  );

  if (!user || !user.is_active) throw INVALID;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw INVALID;

  const secret  = process.env.JWT_SECRET as string;
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn'] };
  const token   = jwt.sign({ id: user.id, name: user.name }, secret, options);
  const { exp } = jwt.decode(token) as { exp: number };

  return { token, user: { id: user.id, name: user.name }, expiresAt: exp * 1000 };
};