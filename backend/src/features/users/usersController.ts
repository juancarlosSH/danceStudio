import { Request, Response } from 'express';
import {
  registerUser,
  updatePassword,
  updatePayment,
  getClassesTaken,
  getRemainingClasses,
  getRemainingDays,
  getProfile,
} from './usersService';
import { AuthRequest } from '../../middlewares/authMiddleware';

/**
 * All /me/* handlers read the user id from `req.user.id` (populated by
 * authMiddleware from the verified JWT), never from the URL or body.
 *
 * This makes IDOR impossible by construction: there is no client-supplied
 * identifier for these endpoints to tamper with.
 *
 * See ADR-001 in docs/DECISIONS.md.
 */

export const registerUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, password, paid_at, classes_paid } = req.body;
    const user = await registerUser({ name, password, paid_at, classes_paid });
    res.status(201).json(user);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const updatePasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = (req as AuthRequest).user.id;
    const { password } = req.body;
    if (!password) { res.status(400).json({ message: 'password is required' }); return; }
    const result = await updatePassword(id, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const updatePaymentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = (req as AuthRequest).user.id;
    const { paid_at, classes_paid } = req.body;
    const result = await updatePayment(id, paid_at, Number(classes_paid));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const getClassesTakenHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = (req as AuthRequest).user.id;
    const result = await getClassesTaken(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const getRemainingClassesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = (req as AuthRequest).user.id;
    const result = await getRemainingClasses(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const getRemainingDaysHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = (req as AuthRequest).user.id;
    const result = await getRemainingDays(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const getProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = (req as AuthRequest).user.id;
    const result = await getProfile(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};