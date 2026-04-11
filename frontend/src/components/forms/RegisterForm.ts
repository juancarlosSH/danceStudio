import { t, showView } from '../../state/store';

function showError(msg: string): void {
  const el = document.getElementById('register-error');
  if (!el) return;
  el.textContent = msg;
  msg ? el.classList.remove('hidden') : el.classList.add('hidden');
}

function showSuccess(msg: string): void {
  const el = document.getElementById('register-success');
  if (!el) return;
  el.textContent = msg;
  msg ? el.classList.remove('hidden') : el.classList.add('hidden');
}

function setLoading(loading: boolean): void {
  const btn    = document.getElementById('register-btn') as HTMLButtonElement | null;
  const text   = document.querySelector<HTMLElement>('#register-btn .btn-text');
  const loader = document.querySelector<HTMLElement>('#register-btn .btn-loader');
  if (btn)    btn.disabled = loading;
  if (text)   text.classList.toggle('hidden', loading);
  if (loader) loader.classList.toggle('hidden', !loading);
}

export function initRegisterForm(
  onSubmit: (name: string, password: string) => Promise<void>
): void {
  const form = document.getElementById('register-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = (document.getElementById('reg-name') as HTMLInputElement).value.trim();
    const password = (document.getElementById('reg-password') as HTMLInputElement).value;

    if (!name || !password) {
      showError(t('namePasswordRequired'));
      return;
    }

    setLoading(true);
    showError('');
    showSuccess('');
    try {
      await onSubmit(name, password);
      showSuccess(t('accountCreated'));
      form.reset();
    } catch (err: any) {
      showError(err.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  });

  document.getElementById('go-login')?.addEventListener('click', () => {
    showError('');
    showSuccess('');
    showView('login');
  });
}

export function renderRegisterForm(): string {
  return `
    <section id="view-register" class="view hidden">
      <div class="login-bg"><span></span><span></span><span></span></div>
      <div class="login-card">
        <div class="login-header">
          <h1>Dance<br><em>Studio</em></h1>
          <p data-i18n="appSubtitleRegister"></p>
        </div>
        <form id="register-form" novalidate>
          <div class="field">
            <label for="reg-name" data-i18n="labelName"></label>
            <input id="reg-name" type="text" data-i18n-placeholder="placeholderName" autocomplete="username" />
          </div>
          <div class="field">
            <label for="reg-password" data-i18n="labelPassword"></label>
            <input id="reg-password" type="password" data-i18n-placeholder="placeholderPassword" autocomplete="new-password" />
          </div>
          <div id="register-error" class="error-msg hidden"></div>
          <div id="register-success" class="success-msg hidden"></div>
          <button type="submit" id="register-btn" class="btn-primary full">
            <span class="btn-text" data-i18n="btnCreateAccount"></span>
            <span class="btn-loader hidden"></span>
          </button>
        </form>
        <div class="auth-switch">
          <span data-i18n="haveAccount"></span>
          <button type="button" id="go-login" data-i18n="signIn"></button>
        </div>
      </div>
    </section>
  `;
}