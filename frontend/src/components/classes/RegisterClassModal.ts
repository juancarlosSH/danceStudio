import { DanceType } from '../../types';
import { t } from '../../state/store';
import { closeRegisterModal, showModalError, hideModalError } from '../ui/Modal';

export function initRegisterClassForm(
  onSubmit: (type: DanceType, class_date: string) => Promise<void>
): void {
  const form = document.getElementById('register-class-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const typeEl = document.getElementById('class-type') as HTMLSelectElement | null;
    const dateEl = document.getElementById('class-date') as HTMLInputElement | null;

    const type       = typeEl?.value ?? '';
    const class_date = dateEl?.value ?? '';

    if (!type || !class_date) {
      showModalError(t('typeAndDateRequired'));
      return;
    }

    hideModalError();

    try {
      await onSubmit(type as DanceType, class_date);
      closeRegisterModal();
    } catch (err: any) {
      showModalError(err.message ?? 'Error');
    }
  });
}