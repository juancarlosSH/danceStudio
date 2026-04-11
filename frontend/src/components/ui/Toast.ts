import { ToastType } from '../../types';

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function showToast(msg: string, type: ToastType = 'success'): void {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

export function renderToast(): string {
  return `<div id="toast" class="toast hidden"></div>`;
}