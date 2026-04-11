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
    const id = Number(req.params.id);
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
    const id = Number(req.params.id);
    const { paid_at, classes_paid } = req.body;
    const result = await updatePayment(id, paid_at, Number(classes_paid));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const getClassesTakenHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getClassesTaken(Number(req.params.id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const getRemainingClassesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getRemainingClasses(Number(req.params.id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const getRemainingDaysHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getRemainingDays(Number(req.params.id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const getProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getProfile(Number(req.params.id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};