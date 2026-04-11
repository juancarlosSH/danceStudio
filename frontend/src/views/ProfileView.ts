import { renderPaymentForm } from '../components/forms/PaymentForm';
import { renderPasswordForm } from '../components/forms/PasswordForm';

export function renderProfileView(username: string): string {
  return `
    <section id="view-profile" class="view hidden">
      <header class="dash-header">
        <div class="dash-header-left">
          <h2>Dance <em>Studio</em></h2>
        </div>
        <div class="dash-header-right">
          <span id="profile-username">${username}</span>
          <button class="btn-ghost" id="go-dashboard-btn" data-i18n="navDashboard"></button>
          <button class="btn-icon btn-theme" id="theme-toggle-profile" aria-label="Toggle theme">🌙</button>
          <button class="btn-icon btn-lang"  id="lang-toggle-profile"  aria-label="Toggle language">EN</button>
          <button class="btn-ghost btn-logout" id="profile-logout-btn" data-i18n="navLogout"></button>
        </div>
      </header>
      <main class="dash-main profile-main">
        <div class="profile-grid">
          ${renderPaymentForm()}
          ${renderPasswordForm()}
        </div>
      </main>
    </section>
  `;
}