import { detectTheme, applyTheme, toggleTheme, applyLang, toggleLang, showView,
         saveSession, clearSession, restoreSession, setClasses, setStats,
         getUser, t } from './state/store';
import { detectLang } from './i18n/translations';
import {
  apiLogin, apiRegisterUser, apiLoadStats,
  apiGetClassesByUser, apiRegisterClass, apiDeleteClass,
  apiGetProfile, apiUpdatePayment, apiUpdatePassword,
  todayString,
} from './services/api';
import { DanceType } from './types';

import { renderLoginForm,    initLoginForm    } from './components/forms/LoginForm';
import { renderRegisterForm, initRegisterForm  } from './components/forms/RegisterForm';
import { initPaymentForm, populatePaymentForm  } from './components/forms/PaymentForm';
import { initPasswordForm                      } from './components/forms/PasswordForm';

import { renderDashboardView } from './views/DashboardView';
import { renderProfileView   } from './views/ProfileView';

import { renderStats         } from './components/cards/StatCard';
import { renderCalendar, initCalendarListeners } from './components/calendar/Calendar';
import { renderClassTable, initClassTableListeners } from './components/classes/ClassTable';
import { initQuickRegisterListeners } from './components/classes/QuickRegisterButtons';
import { initRegisterClassForm      } from './components/classes/RegisterClassModal';
import { showToast, renderToast     } from './components/ui/Toast';
import { showSkeletons, hideSkeletons } from './components/ui/Skeleton';
import {
  renderRegisterClassModal, renderConfirmDeleteModal,
  initModalListeners, openRegisterModal,
  openConfirmModal, closeConfirmModal, getPendingDeleteId,
} from './components/ui/Modal';

// ── Bootstrap ─────────────────────────────────────────────────
function buildApp(): void {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    ${renderLoginForm()}
    ${renderRegisterForm()}
    ${renderDashboardView('')}
    ${renderProfileView('')}
    ${renderRegisterClassModal()}
    ${renderConfirmDeleteModal()}
    ${renderToast()}
  `;
}

// ── Data loaders ──────────────────────────────────────────────
async function loadDashboard(): Promise<void> {
  const user = getUser();
  if (!user) return;
  showSkeletons();
  try {
    const [stats, classes] = await Promise.all([
      apiLoadStats(user.id),
      apiGetClassesByUser(user.id),
    ]);
    setStats(stats);
    setClasses(classes);
    renderStats(stats);
    renderClassTable(classes);
    renderCalendar(classes);
  } finally {
    hideSkeletons();
  }
}

async function refreshDashboard(): Promise<void> {
  const user = getUser();
  if (!user) return;
  const [stats, classes] = await Promise.all([
    apiLoadStats(user.id),
    apiGetClassesByUser(user.id),
  ]);
  setStats(stats);
  setClasses(classes);
  renderStats(stats);
  renderClassTable(classes);
  renderCalendar(classes);
}

// ── Auth handlers ─────────────────────────────────────────────
async function handleLogin(name: string, password: string): Promise<void> {
  const { token } = await apiLogin(name, password);
  const payload   = JSON.parse(atob(token.split('.')[1]));
  const user      = { id: payload.id, name: payload.name };
  saveSession(token, user);
  document.getElementById('dash-username')!.textContent    = user.name;
  document.getElementById('profile-username')!.textContent = user.name;
  showView('dashboard');
  await loadDashboard();
}

function handleLogout(): void {
  clearSession();
  showView('login');
  (document.getElementById('login-name')     as HTMLInputElement).value = '';
  (document.getElementById('login-password') as HTMLInputElement).value = '';
}

// ── Class handlers ────────────────────────────────────────────
async function handleRegisterClass(type: DanceType, class_date: string): Promise<void> {
  const user = getUser();
  if (!user) return;
  await apiRegisterClass(type, class_date, user.id);
  await refreshDashboard();
  showToast(t('toastClassRegistered'), 'success');
}

async function confirmDelete(): Promise<void> {
  const id = getPendingDeleteId();
  closeConfirmModal();
  if (!id) return;
  const user = getUser();
  if (!user) return;
  try {
    await apiDeleteClass(id);
    await refreshDashboard();
    showToast(t('toastClassDeleted'), 'success');
  } catch (err: any) {
    showToast(err.message, 'error');
  }
}

// ── Profile forms — re-init safe ──────────────────────────────
let profileFormsInited = false;

function initProfileForms(): void {
  if (profileFormsInited) return;
  profileFormsInited = true;

  initPaymentForm(async (paid_at, classes_paid) => {
    const user = getUser();
    if (!user) return;
    await apiUpdatePayment(user.id, paid_at, classes_paid);
    const stats = await apiLoadStats(user.id);
    setStats(stats);
    renderStats(stats);
    showToast(t('toastPaymentUpdated'), 'success');
  });

  initPasswordForm(async (password) => {
    const user = getUser();
    if (!user) return;
    await apiUpdatePassword(user.id, password);
    showToast(t('toastPasswordUpdated'), 'success');
    setTimeout(handleLogout, 2500);
  });
}

// ── Dashboard listeners — init once ───────────────────────────
function initDashboardListeners(): void {
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
  document.getElementById('profile-logout-btn')?.addEventListener('click', handleLogout);

  document.getElementById('go-profile-btn')?.addEventListener('click', async () => {
    const user = getUser();
    if (!user) return;
    document.getElementById('profile-username')!.textContent = user.name;
    showView('profile');
    (document.getElementById('password-form') as HTMLFormElement | null)?.reset();
    const profile = await apiGetProfile(user.id);
    populatePaymentForm(profile);
    initProfileForms();
  });

  document.getElementById('go-dashboard-btn')?.addEventListener('click', () => showView('dashboard'));

  document.querySelectorAll<HTMLElement>('.btn-theme').forEach(b =>
    b.addEventListener('click', toggleTheme)
  );

  document.querySelectorAll<HTMLElement>('.btn-lang').forEach(b =>
    b.addEventListener('click', async () => {
      toggleLang();
      const user = getUser();
      const classes = user ? await apiGetClassesByUser(user.id) : [];
      renderCalendar(classes);
    })
  );

  initQuickRegisterListeners(async (type) => {
    const user = getUser();
    if (!user) return;
    await apiRegisterClass(type, todayString(), user.id);
    await refreshDashboard();
    showToast(`${type} — ${t('toastClassRegistered')}`, 'success');
  });

  initCalendarListeners(async () => {
    const user = getUser();
    if (!user) return;
    const classes = await apiGetClassesByUser(user.id);
    renderCalendar(classes);
  });

  document.getElementById('btn-open-register')?.addEventListener('click', openRegisterModal);
  initModalListeners();
  initRegisterClassForm(handleRegisterClass);
  initClassTableListeners((id) => openConfirmModal(id));
  document.getElementById('confirm-delete')?.addEventListener('click', confirmDelete);
}

// ── Init ──────────────────────────────────────────────────────
async function init(): Promise<void> {
  buildApp();
  applyTheme(detectTheme());
  applyLang(detectLang());

  initLoginForm(handleLogin);
  initRegisterForm(async (name, password) => {
    await apiRegisterUser(name, password);
  });

  initDashboardListeners();

  const session = restoreSession();
  if (session) {
    document.getElementById('dash-username')!.textContent    = session.user.name;
    document.getElementById('profile-username')!.textContent = session.user.name;
    showView('dashboard');
    await loadDashboard();
  } else {
    showView('login');
  }
}

init();