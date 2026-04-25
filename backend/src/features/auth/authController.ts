import { Request, Response } from 'express';
import { login } from './authService';

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, password } = req.body;
    const result = await login(name, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};
