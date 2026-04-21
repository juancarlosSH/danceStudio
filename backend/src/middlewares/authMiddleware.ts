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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    // Assigning via cast: at runtime Express gives us a plain Request, and we
    // enrich it. Downstream handlers type their `req` as AuthRequest.
    (req as AuthRequest).user = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};