import { Request, Response } from 'express';
import { registerClass, deleteClassForUser, getClassesByUser } from './classesService';
import { DanceType } from '../../types';
import { AuthRequest } from '../../middlewares/authMiddleware';

export const registerClassHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // user_id comes from the verified JWT, NOT from req.body.
    // This closes the IDOR where a client could log a class against another
    // user's account by tampering with the request body.
    const user_id = (req as AuthRequest).user.id;
    const { type, class_date } = req.body;
    const result = await registerClass({
      type: type as DanceType,
      class_date,
      user_id,
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const deleteClassHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const classId = Number(req.params.id);
    const userId  = (req as AuthRequest).user.id;
    // deleteClassForUser performs the ownership check atomically:
    // a class is deleted only if it belongs to `userId`. Non-owned classes
    // return 404 (not 403) on purpose — we do not leak whether the id exists.
    const result = await deleteClassForUser(classId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};

export const getMyClassesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = (req as AuthRequest).user.id;
    const result = await getClassesByUser(user_id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status ?? 500).json({ message: error.message });
  }
};