const STAT_IDS = ['stat-taken', 'stat-remaining', 'stat-days'] as const;

export function showSkeletons(): void {
  document.querySelectorAll<HTMLElement>('.skeleton-row').forEach(r => r.classList.remove('hidden'));
  document.getElementById('classes-empty-row')?.classList.add('hidden');

  const count = document.getElementById('classes-count');
  if (count) {
    count.textContent = '';
    count.classList.add('hidden');
  }

  STAT_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = '—';
      el.classList.add('loading');
    }
  });
}

export function hideSkeletons(): void {
  document.querySelectorAll<HTMLElement>('.skeleton-row').forEach(r => r.classList.add('hidden'));
  STAT_IDS.forEach(id => {
    document.getElementById(id)?.classList.remove('loading');
  });
}

export function renderSkeletonRows(): string {
  return `
    <tr class="skeleton-row">
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td></td>
    </tr>
    <tr class="skeleton-row">
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td></td>
    </tr>
    <tr class="skeleton-row">
      <td><div class="skeleton"></div></td>
      <td><div class="skeleton"></div></td>
      <td></td>
    </tr>
  `;
}