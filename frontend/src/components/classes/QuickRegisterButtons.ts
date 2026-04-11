import { DanceType } from '../../types';

const DANCE_TYPES: DanceType[] = ['Bachata', 'Salsa', 'Cumbia'];

export function renderQuickRegisterButtons(): string {
  return `
    <div class="quick-register">
      <button class="btn-quick btn-quick-bachata" data-type="Bachata" data-i18n="btnBachata"></button>
      <button class="btn-quick btn-quick-salsa"   data-type="Salsa"   data-i18n="btnSalsa"></button>
      <button class="btn-quick btn-quick-cumbia"  data-type="Cumbia"  data-i18n="btnCumbia"></button>
    </div>
  `;
}

export function initQuickRegisterListeners(
  onRegister: (type: DanceType) => Promise<void>
): void {
  DANCE_TYPES.forEach(type => {
    const btn = document.querySelector<HTMLButtonElement>(`.btn-quick[data-type="${type}"]`);
    if (!btn) return;

    btn.addEventListener('click', async () => {
      btn.classList.add('loading');
      try {
        await onRegister(type);
      } finally {
        btn.classList.remove('loading');
      }
    });
  });
}