import { ProfileData } from '../../types';
import { t } from '../../state/store';

function showError(msg: string): void {
  const el = document.getElementById('payment-error');
  if (!el) return;
  el.textContent = msg;
  msg ? el.classList.remove('hidden') : el.classList.add('hidden');
}

function setLoading(loading: boolean): void {
  const btn    = document.getElementById('payment-btn') as HTMLButtonElement | null;
  const text   = document.querySelector<HTMLElement>('#payment-btn .btn-text');
  const loader = document.querySelector<HTMLElement>('#payment-btn .btn-loader');
  if (btn)    btn.disabled = loading;
  if (text)   text.classList.toggle('hidden', loading);
  if (loader) loader.classList.toggle('hidden', !loading);
}

export function populatePaymentForm(profile: ProfileData): void {
  const paidAt = document.getElementById('prof-paid-at') as HTMLInputElement | null;
  if (paidAt) paidAt.value = profile.paid_at ?? '';

  document.querySelectorAll<HTMLInputElement>('input[name="classes_paid"]').forEach(r => {
    r.checked = parseInt(r.value) === profile.classes_paid;
  });
}

export function initPaymentForm(
  onSubmit: (paid_at: string, classes_paid: number) => Promise<void>
): void {
  const form = document.getElementById('payment-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const paid_at       = (document.getElementById('prof-paid-at') as HTMLInputElement).value;
    const classesPaidEl = document.querySelector<HTMLInputElement>('input[name="classes_paid"]:checked');

    if (!paid_at || !classesPaidEl) {
      showError(t('paymentRequired'));
      return;
    }

    setLoading(true);
    showError('');
    try {
      await onSubmit(paid_at, parseInt(classesPaidEl.value));
    } catch (err: any) {
      showError(err.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  });
}

export function renderPaymentForm(): string {
  return `
    <div class="profile-card">
      <div class="profile-card-header">
        <span class="profile-card-icon" data-i18n="profileIcon"></span>
        <h3 data-i18n="profileTitle"></h3>
      </div>
      <form id="payment-form" novalidate>
        <div class="field">
          <label for="prof-paid-at" data-i18n="labelPaidAt"></label>
          <input id="prof-paid-at" type="date" />
        </div>
        <div class="field">
          <label data-i18n="labelClassesPaid"></label>
          <div class="classes-options">
            <label class="option-pill">
              <input type="radio" name="classes_paid" value="12" />
              <span>12</span>
            </label>
            <label class="option-pill">
              <input type="radio" name="classes_paid" value="15" />
              <span>15</span>
            </label>
          </div>
        </div>
        <div id="payment-error" class="error-msg hidden"></div>
        <button type="submit" id="payment-btn" class="btn-primary full">
          <span class="btn-text" data-i18n="btnSaveChanges"></span>
          <span class="btn-loader hidden"></span>
        </button>
      </form>
    </div>
  `;
}