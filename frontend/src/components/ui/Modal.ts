import { todayLocal } from '../../services/api';
import { t } from '../../state/store';

// ── Generic helpers ───────────────────────────────────────────
export function openOverlay(id: string): void {
  document.getElementById(id)?.classList.remove('hidden');
}

export function closeOverlay(id: string): void {
  document.getElementById(id)?.classList.add('hidden');
}

// ── Register class modal ──────────────────────────────────────
export function openRegisterModal(): void {
  const dateInput = document.getElementById('class-date') as HTMLInputElement | null;
  if (dateInput) {
    dateInput.value = todayLocal();
  }
  openOverlay('modal-overlay');
}

export function closeRegisterModal(): void {
  closeOverlay('modal-overlay');
  (document.getElementById('register-class-form') as HTMLFormElement | null)?.reset();
  hideModalError();
}

export function showModalError(msg: string): void {
  const el = document.getElementById('class-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

export function hideModalError(): void {
  document.getElementById('class-error')?.classList.add('hidden');
}

// ── Confirm delete modal ──────────────────────────────────────
export function openConfirmModal(id: number): void {
  (window as any).__pendingDeleteId = id;
  openOverlay('confirm-overlay');
}

export function closeConfirmModal(): void {
  (window as any).__pendingDeleteId = null;
  closeOverlay('confirm-overlay');
}

export function getPendingDeleteId(): number | null {
  return (window as any).__pendingDeleteId ?? null;
}

// ── HTML templates ────────────────────────────────────────────
export function renderRegisterClassModal(): string {
  return `
    <div id="modal-overlay" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <h4 data-i18n="modalRegisterTitle"></h4>
          <button class="modal-close" id="modal-close">✕</button>
        </div>
        <form id="register-class-form" novalidate>
          <div class="field">
            <label for="class-type" data-i18n="labelType"></label>
            <select id="class-type">
              <option value="" data-i18n="selectType"></option>
              <option value="Bachata">Bachata</option>
              <option value="Salsa">Salsa</option>
              <option value="Cumbia">Cumbia</option>
            </select>
          </div>
          <div class="field">
            <label for="class-date" data-i18n="labelDate"></label>
            <input id="class-date" type="date" />
          </div>
          <div id="class-error" class="error-msg hidden"></div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" id="btn-cancel-register" data-i18n="btnCancel"></button>
            <button type="submit" class="btn-primary" data-i18n="btnSaveClass"></button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderConfirmDeleteModal(): string {
  return `
    <div id="confirm-overlay" class="modal-overlay hidden">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h4 data-i18n="modalDeleteTitle"></h4>
        </div>
        <p class="confirm-msg" data-i18n="confirmDeleteMsg"></p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" id="confirm-cancel" data-i18n="btnCancel"></button>
          <button type="button" class="btn-danger"    id="confirm-delete" data-i18n="btnDelete"></button>
        </div>
      </div>
    </div>
  `;
}

// ── Overlay click-outside listeners ──────────────────────────
export function initModalListeners(): void {
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'modal-overlay') closeRegisterModal();
  });
  document.getElementById('confirm-overlay')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'confirm-overlay') closeConfirmModal();
  });
  document.getElementById('modal-close')?.addEventListener('click', closeRegisterModal);
  document.getElementById('btn-cancel-register')?.addEventListener('click', closeRegisterModal);
  document.getElementById('confirm-cancel')?.addEventListener('click', closeConfirmModal);
}