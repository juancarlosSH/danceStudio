import { DanceClass } from '../../types';
import { getLang, t } from '../../state/store';
import { formatDate } from '../../state/store';
import { renderSkeletonRows } from '../ui/Skeleton';

export function renderClassTable(classes: DanceClass[]): void {
  const tbody     = document.getElementById('classes-tbody');
  const emptyRow  = document.getElementById('classes-empty-row');
  const countEl   = document.getElementById('classes-count');
  if (!tbody) return;

  tbody.querySelectorAll('tr[data-id]').forEach(r => r.remove());

  if (countEl) {
    if (classes.length > 0) {
      countEl.textContent = String(classes.length);
      countEl.classList.remove('hidden');
    } else {
      countEl.classList.add('hidden');
    }
  }

  if (classes.length === 0) {
    emptyRow?.classList.remove('hidden');
    return;
  }

  emptyRow?.classList.add('hidden');

  classes.forEach(cls => {
    const tr = document.createElement('tr');
    tr.dataset.id = String(cls.id);
    tr.innerHTML = `
      <td><span class="badge badge-${cls.type.toLowerCase()}">${cls.type}</span></td>
      <td>${formatDate(cls.class_date, getLang())}</td>
      <td style="text-align:right">
        <button class="btn-delete" data-id="${cls.id}" title="Delete">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

export function renderClassTableHTML(): string {
  return `
    <div class="classes-section">
      <div class="classes-top">
        <h3>
          <span data-i18n="classHistory"></span>
          <span id="classes-count" class="classes-count hidden"></span>
        </h3>
        <button class="btn-add" id="btn-open-register" data-i18n="btnRegisterClass"></button>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th data-i18n="colType"></th>
              <th data-i18n="colDate"></th>
              <th></th>
            </tr>
          </thead>
          <tbody id="classes-tbody">
            <tr id="classes-empty-row" class="hidden">
              <td colspan="3">
                <div class="empty-state">
                  <span class="empty-icon">🕺</span>
                  <p data-i18n="emptyTitle"></p>
                  <span data-i18n="emptySubtitle"></span>
                </div>
              </td>
            </tr>
            ${renderSkeletonRows()}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function initClassTableListeners(
  onDelete: (id: number) => void
): void {
  document.getElementById('classes-tbody')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.btn-delete');
    if (!btn) return;
    const id = parseInt(btn.dataset.id ?? '0');
    if (id) onDelete(id);
  });
}