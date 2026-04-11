export type DanceType = 'Bachata' | 'Salsa' | 'Cumbia';

export interface User {
  id: number;
  name: string;
}

export interface DanceClass {
  id: number;
  type: DanceType;
  class_date: string;
  user_id: number;
  created_at: string;
}

export interface StatsData {
  classes_taken: number;
  classes_remaining: number;
  classes_paid: number;
  days_remaining: number;
  next_payment_date: string;
}

export interface ProfileData {
  id: number;
  name: string;
  paid_at: string;
  classes_paid: number;
}

export type ViewName = 'login' | 'register' | 'dashboard' | 'profile';

export type ToastType = 'success' | 'error';

export type Theme = 'light' | 'dark';

export type Lang = 'en' | 'es';