import { t, showView } from '../../state/store';

function showError(msg: string): void {
  const el = document.getElementById('login-error');
  if (!el) return;
  el.textContent = msg;
  msg ? el.classList.remove('hidden') : el.classList.add('hidden');
}

function setLoading(loading: boolean): void {
  const btn    = document.getElementById('login-btn') as HTMLButtonElement | null;
  const text   = document.querySelector<HTMLElement>('#login-btn .btn-text');
  const loader = document.querySelector<HTMLElement>('#login-btn .btn-loader');
  if (btn)    btn.disabled = loading;
  if (text)   text.classList.toggle('hidden', loading);
  if (loader) loader.classList.toggle('hidden', !loading);
}

export function initLoginForm(
  onSubmit: (name: string, password: string) => Promise<void>
): void {
  const form = document.getElementById('login-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = (document.getElementById('login-name') as HTMLInputElement).value.trim();
    const password = (document.getElementById('login-password') as HTMLInputElement).value;

    if (!name || !password) {
      showError(t('namePasswordRequired'));
      return;
    }

    setLoading(true);
    showError('');
    try {
      await onSubmit(name, password);
    } catch (err: any) {
      showError(err.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  });

  document.getElementById('go-register')?.addEventListener('click', () => {
    showError('');
    showView('register');
  });
}

export function renderLoginForm(): string {
  return `
    <section id="view-login" class="view active">
      <div class="login-bg"><span></span><span></span><span></span></div>
      <div class="login-card">
        <div class="login-header">
          <h1>Dance<br><em>Studio</em></h1>
          <p data-i18n="appSubtitle"></p>
        </div>
        <form id="login-form" novalidate>
          <div class="field">
            <label for="login-name" data-i18n="labelName"></label>
            <input id="login-name" type="text" data-i18n-placeholder="placeholderName" autocomplete="username" />
          </div>
          <div class="field">
            <label for="login-password" data-i18n="labelPassword"></label>
            <input id="login-password" type="password" data-i18n-placeholder="placeholderPassword" autocomplete="current-password" />
          </div>
          <div id="login-error" class="error-msg hidden"></div>
          <button type="submit" id="login-btn" class="btn-primary full">
            <span class="btn-text" data-i18n="btnEnter"></span>
            <span class="btn-loader hidden"></span>
          </button>
        </form>
        <div class="auth-switch">
          <span data-i18n="noAccount"></span>
          <button type="button" id="go-register" data-i18n="createOne"></button>
        </div>
      </div>
    </section>
  `;
}