import { DanceClass, DanceType, ProfileData, StatsData, User } from '../types';

const API_URL = (window as any).ENV_API_URL ?? 'http://localhost:3000';

export class UnauthorizedError extends Error {
  constructor() { super('Unauthorized'); }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────
export async function apiLogin(name: string, password: string): Promise<{ user: User; expiresAt: number }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Invalid credentials');
  return data;
}

export async function apiLogout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
}

// ── Users ─────────────────────────────────────────────────────
export async function apiRegisterUser(name: string, password: string): Promise<void> {
  const paid_at = todayString();
  await request('/users', {
    method: 'POST',
    body: JSON.stringify({ name, password, paid_at, classes_paid: 12 }),
  });
}

export async function apiGetClassesTaken(): Promise<{ classes_taken: number }> {
  return request(`/users/me/classes-taken`);
}

export async function apiGetRemainingClasses(): Promise<{
  classes_paid: number;
  classes_taken: number;
  classes_remaining: number;
}> {
  return request(`/users/me/classes-remaining`);
}

export async function apiGetRemainingDays(): Promise<{
  days_remaining: number;
  next_payment_date: string;
}> {
  return request(`/users/me/days-remaining`);
}

export async function apiGetProfile(): Promise<ProfileData> {
  return request(`/users/me/profile`);
}

export async function apiUpdatePayment(paid_at: string, classes_paid: number): Promise<void> {
  await request(`/users/me/payment`, {
    method: 'PATCH',
    body: JSON.stringify({ paid_at, classes_paid }),
  });
}

export async function apiUpdatePassword(password: string): Promise<void> {
  await request(`/users/me/password`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
  });
}

export async function apiLoadStats(): Promise<StatsData> {
  const [taken, remaining, days] = await Promise.all([
    apiGetClassesTaken(),
    apiGetRemainingClasses(),
    apiGetRemainingDays(),
  ]);
  return {
    classes_taken:     taken.classes_taken,
    classes_remaining: remaining.classes_remaining,
    classes_paid:      remaining.classes_paid,
    days_remaining:    days.days_remaining,
    next_payment_date: days.next_payment_date,
  };
}

// ── Classes ───────────────────────────────────────────────────
export async function apiGetMyClasses(): Promise<DanceClass[]> {
  return request(`/classes/mine`);
}

export async function apiRegisterClass(type: DanceType, class_date: string): Promise<DanceClass> {
  return request('/classes', {
    method: 'POST',
    body: JSON.stringify({ type, class_date }),
  });
}

export async function apiDeleteClass(id: number): Promise<void> {
  await request(`/classes/${id}`, { method: 'DELETE' });
}

// ── Utils ─────────────────────────────────────────────────────
export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const todayLocal = todayString;