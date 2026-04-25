import { Request, Response } from 'express';
import { login } from './authService';

function parseExpiryMs(val: string): number {
  const match = val.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 8 * 60 * 60 * 1000;
  const n = Number(match[1]);
  const units: Record<string, number> = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * units[match[2]];
}

const COOKIE_MAX_AGE = parseExpiryMs(process.env.JWT_EXPIRES_IN ?? '8h');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: COOKIE_MAX_AGE,
};

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, password } = req.body;
    const { token, user, expiresAt } = await login(name, password);
    res.cookie('token', token, cookieOptions);
    res.status(200).json({ user, expiresAt });
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const logoutHandler = (_req: Request, res: Response): void => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.status(200).json({ message: 'Logged out' });
};
