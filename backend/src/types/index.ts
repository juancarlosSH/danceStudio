export type DanceType = 'Bachata' | 'Salsa' | 'Cumbia';

export interface User {
  id: number;
  name: string;
  password: string;
  paid_at: string;
  classes_paid: number;
  is_active: boolean;
  created_at: string;
}

export interface DanceClass {
  id: number;
  type: DanceType;
  class_date: string;
  user_id: number;
  created_at: string;
}

export interface JwtPayload {
  id: number;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}