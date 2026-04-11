import { DanceClass, DanceType } from '../../types';
import { getCalMonth, getCalYear, setCalMonth, setCalYear, tMonths, t } from '../../state/store';

type CalendarMap = Record<string, DanceType[]>;

function buildCalendarMap(classes: DanceClass[]): CalendarMap {
  const map: CalendarMap = {};
  classes.forEach(cls => {
    const [year, month, day] = cls.class_date.split('-').map(Number);
    const key = `${year}-${month - 1}-${day}`;
    if (!map[key]) map[key] = [];
    if (!map[key].includes(cls.type)) map[key].push(cls.type);
  });
  return map;
}

export function renderCalendar(classes: DanceClass[]): void {
  const y   = getCalYear();
  const m   = getCalMonth();
  const months = tMonths();

  const titleEl = document.getElementById('cal-title');
  if (titleEl) titleEl.textContent = `${months[m]} ${y}`;

  const dayNamesEl = document.getElementById('cal-day-names');
  if (dayNamesEl) {
    const keys = ['calSu','calMo','calTu','calWe','calTh','calFr','calSa'] as const;
    dayNamesEl.innerHTML = keys
      .map(k => `<div class="cal-day-name">${t(k)}</div>`)
      .join('');
  }

  const calDaysEl = document.getElementById('cal-days');
  if (!calDaysEl) return;

  const map          = buildCalendarMap(classes);
  const today        = new Date();
  const firstWeekday = new Date(y, m, 1).getDay();
  const daysInMonth  = new Date(y, m + 1, 0).getDate();
  const prevDays     = new Date(y, m, 0).getDate();

  let html = '';

  for (let i = 0; i < firstWeekday; i++) {
    const d = prevDays - firstWeekday + i + 1;
    html += `<div class="cal-day other-month"><span>${d}</span><div class="cal-dots"></div></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
    const key     = `${y}-${m}-${d}`;
    const types   = map[key] ?? [];
    const dots    = types.map(type => `<span class="cal-dot dot-${type.toLowerCase()}"></span>`).join('');
    html += `
      <div class="cal-day${isToday ? ' today' : ''}">
        <span>${d}</span>
        <div class="cal-dots">${dots}</div>
      </div>
    `;
  }

  const total     = firstWeekday + daysInMonth;
  const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="cal-day other-month"><span>${i}</span><div class="cal-dots"></div></div>`;
  }

  calDaysEl.innerHTML = html;
}

export function initCalendarListeners(onUpdate: () => void): void {
  document.getElementById('cal-prev')?.addEventListener('click', () => {
    let m = getCalMonth() - 1;
    let y = getCalYear();
    if (m < 0) { m = 11; y--; }
    setCalMonth(m);
    setCalYear(y);
    onUpdate();
  });

  document.getElementById('cal-next')?.addEventListener('click', () => {
    let m = getCalMonth() + 1;
    let y = getCalYear();
    if (m > 11) { m = 0; y++; }
    setCalMonth(m);
    setCalYear(y);
    onUpdate();
  });
}

export function renderCalendarHTML(): string {
  return `
    <div class="calendar-section">
      <div class="calendar-header">
        <button class="cal-nav" id="cal-prev">‹</button>
        <span id="cal-title"></span>
        <button class="cal-nav" id="cal-next">›</button>
      </div>
      <div class="calendar-grid" id="cal-day-names"></div>
      <div id="cal-days" class="calendar-grid"></div>
      <div class="cal-legend">
        <span class="cal-dot dot-bachata"></span>Bachata
        <span class="cal-dot dot-salsa"></span>Salsa
        <span class="cal-dot dot-cumbia"></span>Cumbia
      </div>
    </div>
  `;
}