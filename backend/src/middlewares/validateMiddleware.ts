import { Request, Response, NextFunction } from 'express';

const DATE_REGEX  = /^\d{4}-\d{2}-\d{2}$/;
const VALID_TYPES = ['Bachata', 'Salsa', 'Cumbia'];

export const validateRegisterUser = (req: Request, res: Response, next: NextFunction): void => {
  const { name, password, paid_at, classes_paid } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ message: 'name must be at least 2 characters' });
    return;
  }
  if (!password || typeof password !== 'string' || password.length < 4) {
    res.status(400).json({ message: 'password must be at least 4 characters' });
    return;
  }
  if (!paid_at || !DATE_REGEX.test(paid_at)) {
    res.status(400).json({ message: 'paid_at must be a valid date YYYY-MM-DD' });
    return;
  }
  if (classes_paid === undefined || ![0, 12, 15].includes(Number(classes_paid))) {
    res.status(400).json({ message: 'classes_paid must be 0, 12 or 15' });
    return;
  }
  next();
};

export const validateUpdatePayment = (req: Request, res: Response, next: NextFunction): void => {
  const { paid_at, classes_paid } = req.body;
  if (!paid_at || !DATE_REGEX.test(paid_at)) {
    res.status(400).json({ message: 'paid_at must be a valid date YYYY-MM-DD' });
    return;
  }
  if (![12, 15].includes(Number(classes_paid))) {
    res.status(400).json({ message: 'classes_paid must be 12 or 15' });
    return;
  }
  next();
};

export const validateRegisterClass = (req: Request, res: Response, next: NextFunction): void => {
  const { type, class_date, user_id } = req.body;
  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ message: `type must be one of: ${VALID_TYPES.join(', ')}` });
    return;
  }
  if (!class_date || !DATE_REGEX.test(class_date)) {
    res.status(400).json({ message: 'class_date must be a valid date YYYY-MM-DD' });
    return;
  }
  if (!user_id || isNaN(Number(user_id))) {
    res.status(400).json({ message: 'user_id must be a valid number' });
    return;
  }
  next();
};

export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  const id = req.params.id ?? req.params.user_id;
  if (!id || isNaN(Number(id))) {
    res.status(400).json({ message: 'id must be a valid number' });
    return;
  }
  next();
};