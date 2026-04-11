import { renderStatsGrid } from '../components/cards/StatCard';
import { renderCalendarHTML } from '../components/calendar/Calendar';
import { renderClassTableHTML } from '../components/classes/ClassTable';
import { renderQuickRegisterButtons } from '../components/classes/QuickRegisterButtons';
import { renderRegisterClassModal, renderConfirmDeleteModal } from '../components/ui/Modal';

export function renderDashboardView(username: string): string {
  return `
    <section id="view-dashboard" class="view hidden">
      <header class="dash-header">
        <div class="dash-header-left">
          <h2>Dance <em>Studio</em></h2>
        </div>
        <div class="dash-header-right">
          <span id="dash-username">${username}</span>
          <button class="btn-ghost" id="go-profile-btn" data-i18n="navProfile"></button>
          <button class="btn-icon btn-theme" id="theme-toggle" aria-label="Toggle theme">🌙</button>
          <button class="btn-icon btn-lang"  id="lang-toggle"  aria-label="Toggle language">EN</button>
          <button class="btn-ghost btn-logout" id="logout-btn" data-i18n="navLogout"></button>
        </div>
      </header>
      <main class="dash-main">
        ${renderStatsGrid()}
        ${renderQuickRegisterButtons()}
        <div class="content-grid">
          ${renderCalendarHTML()}
          ${renderClassTableHTML()}
        </div>
      </main>
    </section>
  `;
}