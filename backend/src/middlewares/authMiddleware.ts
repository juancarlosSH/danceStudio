import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

/**
 * Request shape AFTER `authMiddleware` has run.
 *
 * `user` is non-optional here on purpose: handlers that sit behind
 * `authMiddleware` should be able to trust that `req.user` exists without
 * re-checking. If the token is missing or invalid, the middleware short-
 * circuits with 401/403 and the handler is never reached.
 *
 * See ADR-001 in docs/DECISIONS.md for why this matters for IDOR prevention.
 */
export interface AuthRequest extends Request {
  user: JwtPayload;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    (req as AuthRequest).user = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};