import { Request, Response } from 'express';
import { registerClass, deleteClass, getClassesByUser } from './classesService';
import { DanceType } from '../../types';

export const registerClassHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, class_date, user_id } = req.body;
    const result = await registerClass({
      type: type as DanceType,
      class_date,
      user_id: Number(user_id),
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const deleteClassHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await deleteClass(Number(req.params.id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const getClassesByUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getClassesByUser(Number(req.params.user_id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};