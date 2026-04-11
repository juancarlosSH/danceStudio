import { t } from '../../state/store';

function showError(msg: string): void {
  const el = document.getElementById('password-error');
  if (!el) return;
  el.textContent = msg;
  msg ? el.classList.remove('hidden') : el.classList.add('hidden');
}

function setLoading(loading: boolean): void {
  const btn    = document.getElementById('password-btn') as HTMLButtonElement | null;
  const text   = document.querySelector<HTMLElement>('#password-btn .btn-text');
  const loader = document.querySelector<HTMLElement>('#password-btn .btn-loader');
  if (btn)    btn.disabled = loading;
  if (text)   text.classList.toggle('hidden', loading);
  if (loader) loader.classList.toggle('hidden', !loading);
}

export function initPasswordForm(
  onSubmit: (password: string) => Promise<void>
): void {
  const form = document.getElementById('password-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword     = (document.getElementById('prof-new-password') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('prof-confirm-password') as HTMLInputElement).value;

    if (!newPassword || !confirmPassword) {
      showError(t('bothFieldsRequired'));
      return;
    }
    if (newPassword !== confirmPassword) {
      showError(t('passwordsNoMatch'));
      return;
    }

    setLoading(true);
    showError('');
    try {
      await onSubmit(newPassword);
      form.reset();
    } catch (err: any) {
      showError(err.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  });
}

export function renderPasswordForm(): string {
  return `
    <div class="profile-card">
      <div class="profile-card-header">
        <span class="profile-card-icon" data-i18n="passwordIcon"></span>
        <h3 data-i18n="passwordTitle"></h3>
      </div>
      <p class="profile-card-note" data-i18n="passwordNote"></p>
      <form id="password-form" novalidate>
        <div class="field">
          <label for="prof-new-password" data-i18n="labelNewPassword"></label>
          <input id="prof-new-password" type="password" data-i18n-placeholder="placeholderPassword" autocomplete="new-password" />
        </div>
        <div class="field">
          <label for="prof-confirm-password" data-i18n="labelConfirmPassword"></label>
          <input id="prof-confirm-password" type="password" data-i18n-placeholder="placeholderPassword" autocomplete="new-password" />
        </div>
        <div id="password-error" class="error-msg hidden"></div>
        <button type="submit" id="password-btn" class="btn-primary full">
          <span class="btn-text" data-i18n="btnUpdatePassword"></span>
          <span class="btn-loader hidden"></span>
        </button>
      </form>
    </div>
  `;
}