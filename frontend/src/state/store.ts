import { DanceClass, Lang, StatsData, Theme, User, ViewName } from '../types';
import { TRANSLATIONS, Translations, detectLang } from '../i18n/translations';

// ── State ─────────────────────────────────────────────────────
interface AppState {
  token:           string | null;
  user:            User | null;
  classes:         DanceClass[];
  stats:           StatsData | null;
  pendingDeleteId: number | null;
  calYear:         number;
  calMonth:        number;
  lang:            Lang;
  theme:           Theme;
}

const state: AppState = {
  token:           null,
  user:            null,
  classes:         [],
  stats:           null,
  pendingDeleteId: null,
  calYear:         new Date().getFullYear(),
  calMonth:        new Date().getMonth(),
  lang:            'en',
  theme:           'light',
};

// ── Getters ───────────────────────────────────────────────────
export const getToken          = (): string | null  => state.token;
export const getUser           = (): User | null     => state.user;
export const getClasses        = (): DanceClass[]    => state.classes;
export const getStats          = (): StatsData | null => state.stats;
export const getPendingDeleteId = (): number | null  => state.pendingDeleteId;
export const getCalYear        = (): number          => state.calYear;
export const getCalMonth       = (): number          => state.calMonth;
export const getLang           = (): Lang            => state.lang;
export const getTheme          = (): Theme           => state.theme;

// ── Setters ───────────────────────────────────────────────────
export const setToken  = (token: string | null): void  => { state.token = token; };
export const setUser   = (user: User | null): void     => { state.user = user; };
export const setClasses = (classes: DanceClass[]): void => { state.classes = classes; };
export const setStats  = (stats: StatsData | null): void => { state.stats = stats; };
export const setPendingDeleteId = (id: number | null): void => { state.pendingDeleteId = id; };
export const setCalYear  = (y: number): void => { state.calYear = y; };
export const setCalMonth = (m: number): void => { state.calMonth = m; };

// ── Session ───────────────────────────────────────────────────
export function saveSession(token: string, user: User): void {
  state.token = token;
  state.user  = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession(): void {
  state.token   = null;
  state.user    = null;
  state.classes = [];
  state.stats   = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function restoreSession(): { token: string; user: User } | null {
  const savedToken = localStorage.getItem('token');
  const savedUser  = localStorage.getItem('user');
  if (!savedToken || !savedUser) return null;
  try {
    const payload = JSON.parse(atob(savedToken.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) return null;
    const user = JSON.parse(savedUser) as User;
    state.token = savedToken;
    state.user  = user;
    return { token: savedToken, user };
  } catch {
    return null;
  }
}

// ── Theme ─────────────────────────────────────────────────────
export function detectTheme(): Theme {
  const saved = localStorage.getItem('theme') as Theme | null;
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const icon = theme === 'dark' ? '☀️' : '🌙';
  document.querySelectorAll<HTMLElement>('.btn-theme').forEach(b => b.textContent = icon);
}

export function toggleTheme(): void {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

// ── i18n ──────────────────────────────────────────────────────
export function applyLang(lang: Lang): void {
  state.lang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n') as keyof Translations;
    const val = TRANSLATIONS[lang][key];
    if (typeof val === 'string') el.textContent = val;
  });

  document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder') as keyof Translations;
    const val = TRANSLATIONS[lang][key];
    if (typeof val === 'string') el.placeholder = val;
  });

  const label = lang === 'es' ? 'ES' : 'EN';
  document.querySelectorAll<HTMLElement>('.btn-lang').forEach(b => b.textContent = label);
}

export function toggleLang(): void {
  applyLang(state.lang === 'es' ? 'en' : 'es');
}

export function t(key: keyof Translations): string {
  const val = TRANSLATIONS[state.lang][key];
  return typeof val === 'string' ? val : '';
}

export function tMonths(): string[] {
  return TRANSLATIONS[state.lang].calMonths;
}

// ── Views ─────────────────────────────────────────────────────
export function showView(name: ViewName): void {
  document.querySelectorAll<HTMLElement>('.view').forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active');
  });
  const target = document.getElementById(`view-${name}`);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }
  window.scrollTo(0, 0);
}

// ── Utilities ─────────────────────────────────────────────────
export function formatDate(dateStr: string, lang: Lang): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const locale = lang === 'es' ? 'es-MX' : 'en-US';
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}