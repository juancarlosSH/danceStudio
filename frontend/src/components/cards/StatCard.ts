import { StatsData } from '../../types';

export function applyCardAlerts(stats: StatsData): void {
  const cardRemaining = document.getElementById('card-remaining');
  const cardDays      = document.getElementById('card-days');

  cardRemaining?.classList.remove('alert-warning', 'alert-danger');
  cardDays?.classList.remove('alert-warning', 'alert-danger');

  if (stats.classes_remaining <= 0)      cardRemaining?.classList.add('alert-danger');
  else if (stats.classes_remaining <= 3) cardRemaining?.classList.add('alert-warning');

  if (stats.days_remaining <= 0)         cardDays?.classList.add('alert-danger');
  else if (stats.days_remaining <= 5)    cardDays?.classList.add('alert-warning');
}

export function renderStats(stats: StatsData): void {
  const taken     = document.getElementById('stat-taken');
  const remaining = document.getElementById('stat-remaining');
  const days      = document.getElementById('stat-days');

  if (taken)     taken.textContent     = String(stats.classes_taken);
  if (remaining) remaining.textContent = String(stats.classes_remaining);
  if (days)      days.textContent      = String(stats.days_remaining);

  applyCardAlerts(stats);
}

export function renderStatsGrid(): string {
  return `
    <div class="stats-grid">
      <div class="stat-card" id="card-taken">
        <div class="stat-icon">🪩</div>
        <div class="stat-info">
          <span class="stat-label" data-i18n="cardClassesTaken"></span>
          <span class="stat-value skeleton-val" id="stat-taken">—</span>
        </div>
      </div>
      <div class="stat-card" id="card-remaining">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <span class="stat-label" data-i18n="cardClassesRemaining"></span>
          <span class="stat-value skeleton-val" id="stat-remaining">—</span>
        </div>
      </div>
      <div class="stat-card" id="card-days">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <span class="stat-label" data-i18n="cardDaysPayment"></span>
          <span class="stat-value skeleton-val" id="stat-days">—</span>
        </div>
      </div>
    </div>
  `;
}