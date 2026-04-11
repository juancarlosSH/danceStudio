const API_URL = window.ENV_API_URL || "http://localhost:3000";

// ── i18n ─────────────────────────────────────────────────────
let currentLang = "en";

function detectLang() {
  const saved = localStorage.getItem("lang");
  if (saved) return saved;
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return browser === "es" ? "es" : "en";
}

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (TRANSLATIONS[lang][key] !== undefined)
      el.textContent = TRANSLATIONS[lang][key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (TRANSLATIONS[lang][key] !== undefined)
      el.placeholder = TRANSLATIONS[lang][key];
  });

  const label = lang === "es" ? "ES" : "EN";
  document
    .querySelectorAll("#lang-toggle, #lang-toggle-profile")
    .forEach((b) => (b.textContent = label));

  renderCalendar();
}

function t(key) {
  return TRANSLATIONS[currentLang][key] || key;
}

// ── Dark mode ─────────────────────────────────────────────────
function detectTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const icon = theme === "dark" ? "☀️" : "🌙";
  document
    .querySelectorAll("#theme-toggle, #theme-toggle-profile")
    .forEach((b) => (b.textContent = icon));
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

function toggleLang() {
  applyLang(currentLang === "es" ? "en" : "es");
}

// ── State ─────────────────────────────────────────────────────
const state = {
  token: null,
  user: null,
  classes: [],
  pendingDeleteId: null,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
};

// ── DOM refs ──────────────────────────────────────────────────
const views = {
  login: document.getElementById("view-login"),
  register: document.getElementById("view-register"),
  dashboard: document.getElementById("view-dashboard"),
  profile: document.getElementById("view-profile"),
};

const el = {
  loginForm: document.getElementById("login-form"),
  loginName: document.getElementById("login-name"),
  loginPassword: document.getElementById("login-password"),
  loginError: document.getElementById("login-error"),
  loginBtn: document.getElementById("login-btn"),
  loginBtnText: document.querySelector("#login-btn .btn-text"),
  loginBtnLoader: document.querySelector("#login-btn .btn-loader"),
  goRegister: document.getElementById("go-register"),

  registerForm: document.getElementById("register-form"),
  regName: document.getElementById("reg-name"),
  regPassword: document.getElementById("reg-password"),
  registerError: document.getElementById("register-error"),
  registerSuccess: document.getElementById("register-success"),
  registerBtn: document.getElementById("register-btn"),
  registerBtnText: document.querySelector("#register-btn .btn-text"),
  registerBtnLoader: document.querySelector("#register-btn .btn-loader"),
  goLogin: document.getElementById("go-login"),

  dashUsername: document.getElementById("dash-username"),
  logoutBtn: document.getElementById("logout-btn"),
  goProfileBtn: document.getElementById("go-profile-btn"),

  profileUsername: document.getElementById("profile-username"),
  profileLogoutBtn: document.getElementById("profile-logout-btn"),
  goDashboardBtn: document.getElementById("go-dashboard-btn"),

  paymentForm: document.getElementById("payment-form"),
  profPaidAt: document.getElementById("prof-paid-at"),
  paymentError: document.getElementById("payment-error"),
  paymentBtn: document.getElementById("payment-btn"),
  paymentBtnText: document.querySelector("#payment-btn .btn-text"),
  paymentBtnLoader: document.querySelector("#payment-btn .btn-loader"),

  passwordForm: document.getElementById("password-form"),
  profNewPassword: document.getElementById("prof-new-password"),
  profConfirmPassword: document.getElementById("prof-confirm-password"),
  passwordError: document.getElementById("password-error"),
  passwordBtn: document.getElementById("password-btn"),
  passwordBtnText: document.querySelector("#password-btn .btn-text"),
  passwordBtnLoader: document.querySelector("#password-btn .btn-loader"),

  cardTaken: document.getElementById("card-taken"),
  cardRemaining: document.getElementById("card-remaining"),
  cardDays: document.getElementById("card-days"),
  statTaken: document.getElementById("stat-taken"),
  statRemaining: document.getElementById("stat-remaining"),
  statDays: document.getElementById("stat-days"),

  quickBtns: document.querySelectorAll(".btn-quick"),

  calTitle: document.getElementById("cal-title"),
  calPrev: document.getElementById("cal-prev"),
  calNext: document.getElementById("cal-next"),
  calDayNames: document.getElementById("cal-day-names"),
  calDays: document.getElementById("cal-days"),

  btnOpenRegister: document.getElementById("btn-open-register"),
  btnCancelRegister: document.getElementById("btn-cancel-register"),
  modalOverlay: document.getElementById("modal-overlay"),
  modalClose: document.getElementById("modal-close"),
  registerClassForm: document.getElementById("register-class-form"),
  classType: document.getElementById("class-type"),
  classDate: document.getElementById("class-date"),
  classError: document.getElementById("class-error"),
  selectTypePlaceholder: document.querySelector('#class-type option[value=""]'),

  confirmOverlay: document.getElementById("confirm-overlay"),
  confirmCancel: document.getElementById("confirm-cancel"),
  confirmDelete: document.getElementById("confirm-delete"),

  classesTbody: document.getElementById("classes-tbody"),
  classesEmptyRow: document.getElementById("classes-empty-row"),
  classesCount: document.getElementById("classes-count"),
  skeletonRows: document.querySelectorAll(".skeleton-row"),

  toast: document.getElementById("toast"),
};

// ── View switching ────────────────────────────────────────────
function showView(name) {
  Object.values(views).forEach((v) => {
    v.classList.add("hidden");
    v.classList.remove("active");
  });
  views[name].classList.remove("hidden");
  views[name].classList.add("active");
  window.scrollTo(0, 0);
}

// ── Toast ─────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = "success") {
  el.toast.textContent = msg;
  el.toast.className = `toast ${type}`;
  el.toast.classList.remove("hidden");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.add("hidden"), 3000);
}

// ── Modals ────────────────────────────────────────────────────
function openModal() {
  el.classDate.valueAsDate = new Date();
  el.modalOverlay.classList.remove("hidden");
}
function closeModal() {
  el.modalOverlay.classList.add("hidden");
  el.registerClassForm.reset();
  showError(el.classError, "");
}
function openConfirm(id) {
  state.pendingDeleteId = id;
  el.confirmOverlay.classList.remove("hidden");
}
function closeConfirm() {
  state.pendingDeleteId = null;
  el.confirmOverlay.classList.add("hidden");
}

// ── Skeleton ──────────────────────────────────────────────────
function showSkeletons() {
  el.skeletonRows.forEach((r) => r.classList.remove("hidden"));
  el.classesEmptyRow.classList.add("hidden");
  el.classesCount.textContent = "";
  el.classesCount.classList.add("hidden");
  [el.statTaken, el.statRemaining, el.statDays].forEach((s) => {
    s.textContent = "—";
    s.classList.add("loading");
  });
}
function hideSkeletons() {
  el.skeletonRows.forEach((r) => r.classList.add("hidden"));
  [el.statTaken, el.statRemaining, el.statDays].forEach((s) =>
    s.classList.remove("loading"),
  );
}

// ── Card alerts ───────────────────────────────────────────────
function applyCardAlerts(remaining, days) {
  el.cardRemaining.classList.remove("alert-warning", "alert-danger");
  el.cardDays.classList.remove("alert-warning", "alert-danger");
  if (remaining <= 0) el.cardRemaining.classList.add("alert-danger");
  else if (remaining <= 3) el.cardRemaining.classList.add("alert-warning");
  if (days <= 0) el.cardDays.classList.add("alert-danger");
  else if (days <= 5) el.cardDays.classList.add("alert-warning");
}

// ── Calendar ──────────────────────────────────────────────────
function buildCalendarMap() {
  const map = {};
  state.classes.forEach((cls) => {
    const d = new Date(cls.class_date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map[key]) map[key] = [];
    if (!map[key].includes(cls.type)) map[key].push(cls.type);
  });
  return map;
}

function renderCalendar() {
  if (!el.calTitle) return;
  const { calYear: y, calMonth: m } = state;
  const months = t("calMonths");
  el.calTitle.textContent = `${months[m]} ${y}`;

  el.calDayNames.innerHTML = "";
  ["calSu", "calMo", "calTu", "calWe", "calTh", "calFr", "calSa"].forEach(
    (k) => {
      const d = document.createElement("div");
      d.className = "cal-day-name";
      d.textContent = t(k);
      el.calDayNames.appendChild(d);
    },
  );

  const map = buildCalendarMap();
  const today = new Date();
  const first = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  el.calDays.innerHTML = "";

  for (let i = 0; i < first; i++) {
    const d = document.createElement("div");
    d.className = "cal-day other-month";
    d.innerHTML = `<span>${prevDays - first + i + 1}</span><div class="cal-dots"></div>`;
    el.calDays.appendChild(d);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    const isToday =
      d === today.getDate() &&
      m === today.getMonth() &&
      y === today.getFullYear();
    cell.className = `cal-day${isToday ? " today" : ""}`;
    const types = map[`${y}-${m}-${d}`] || [];
    const dots = types
      .map((t) => `<span class="cal-dot dot-${t.toLowerCase()}"></span>`)
      .join("");
    cell.innerHTML = `<span>${d}</span><div class="cal-dots">${dots}</div>`;
    el.calDays.appendChild(cell);
  }
  const total = first + daysInMonth;
  const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let i = 1; i <= remaining; i++) {
    const d = document.createElement("div");
    d.className = "cal-day other-month";
    d.innerHTML = `<span>${i}</span><div class="cal-dots"></div>`;
    el.calDays.appendChild(d);
  }
}

// ── Auth ──────────────────────────────────────────────────────
async function login(name, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || t("namePasswordRequired"));
  return data;
}

async function registerUser(name, password) {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      password,
      paid_at: new Date().toISOString().split("T")[0],
      classes_paid: 0,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
}

function logout() {
  state.token = null;
  state.user = null;
  state.classes = [];
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showView("login");
  el.loginName.value = "";
  el.loginPassword.value = "";
  showError(el.loginError, "");
}

// ── API ───────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Stats ─────────────────────────────────────────────────────
async function loadStats() {
  const id = state.user.id;
  const [taken, remaining, days] = await Promise.all([
    apiFetch(`/users/${id}/classes-taken`),
    apiFetch(`/users/${id}/classes-remaining`),
    apiFetch(`/users/${id}/days-remaining`),
  ]);
  el.statTaken.textContent = taken.classes_taken;
  el.statRemaining.textContent = remaining.classes_remaining;
  el.statDays.textContent = days.days_remaining;
  applyCardAlerts(remaining.classes_remaining, days.days_remaining);
}

// ── Classes ───────────────────────────────────────────────────
async function loadClasses() {
  const data = await apiFetch(`/classes/user/${state.user.id}`);
  state.classes = data;
  renderClasses();
  renderCalendar();
}

function updateCount() {
  const n = state.classes.length;
  if (n > 0) {
    el.classesCount.textContent = n;
    el.classesCount.classList.remove("hidden");
  } else {
    el.classesCount.classList.add("hidden");
  }
}

function renderClasses() {
  el.classesTbody.querySelectorAll("tr[data-id]").forEach((r) => r.remove());
  updateCount();
  if (state.classes.length === 0) {
    el.classesEmptyRow.classList.remove("hidden");
    return;
  }
  el.classesEmptyRow.classList.add("hidden");
  state.classes.forEach((cls) => {
    const tr = document.createElement("tr");
    tr.dataset.id = cls.id;
    tr.innerHTML = `
      <td><span class="badge badge-${cls.type.toLowerCase()}">${cls.type}</span></td>
      <td>${formatDate(cls.class_date)}</td>
      <td style="text-align:right">
        <button class="btn-delete" data-id="${cls.id}" title="Delete">✕</button>
      </td>
    `;
    el.classesTbody.appendChild(tr);
  });
}

async function registerClass(type, class_date) {
  const data = await apiFetch("/classes", {
    method: "POST",
    body: JSON.stringify({ type, class_date, user_id: state.user.id }),
  });
  state.classes.unshift(data);
  renderClasses();
  renderCalendar();
  await loadStats();
}

async function deleteClass(id) {
  await apiFetch(`/classes/${id}`, { method: "DELETE" });
  state.classes = state.classes.filter((c) => c.id !== id);
  renderClasses();
  renderCalendar();
  await loadStats();
}

// ── Profile ───────────────────────────────────────────────────
async function loadProfileData() {
  const res = await apiFetch(`/users/${state.user.id}/profile`);
  el.profPaidAt.value = res.paid_at ? res.paid_at.split("T")[0] : "";
  document.querySelectorAll('input[name="classes_paid"]').forEach((r) => {
    r.checked = parseInt(r.value) === res.classes_paid;
  });
}

// ── Utilities ─────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const locale = currentLang === "es" ? "es-MX" : "en-US";
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function showError(elRef, msg) {
  elRef.textContent = msg;
  msg ? elRef.classList.remove("hidden") : elRef.classList.add("hidden");
}

function showSuccess(elRef, msg) {
  elRef.textContent = msg;
  msg ? elRef.classList.remove("hidden") : elRef.classList.add("hidden");
}

function setLoading(btnEl, textEl, loaderEl, loading) {
  textEl.classList.toggle("hidden", loading);
  loaderEl.classList.toggle("hidden", !loading);
  btnEl.disabled = loading;
}

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ── Event listeners ───────────────────────────────────────────
document
  .querySelectorAll("#theme-toggle, #theme-toggle-profile")
  .forEach((b) => b.addEventListener("click", toggleTheme));
document.querySelectorAll("#lang-toggle, #lang-toggle-profile").forEach((b) =>
  b.addEventListener("click", () => {
    toggleLang();
  }),
);

el.goRegister.addEventListener("click", () => {
  showError(el.loginError, "");
  showView("register");
});
el.goLogin.addEventListener("click", () => {
  showError(el.registerError, "");
  showSuccess(el.registerSuccess, "");
  showView("login");
});

el.loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = el.loginName.value.trim();
  const password = el.loginPassword.value;
  if (!name || !password) {
    showError(el.loginError, t("namePasswordRequired"));
    return;
  }
  setLoading(el.loginBtn, el.loginBtnText, el.loginBtnLoader, true);
  showError(el.loginError, "");
  try {
    const { token } = await login(name, password);
    state.token = token;
    const payload = JSON.parse(atob(token.split(".")[1]));
    state.user = { id: payload.id, name: payload.name };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(state.user));
    el.dashUsername.textContent = state.user.name;
    state.calYear = new Date().getFullYear();
    state.calMonth = new Date().getMonth();
    showView("dashboard");
    showSkeletons();
    await Promise.all([loadStats(), loadClasses()]);
    hideSkeletons();
  } catch (err) {
    showError(el.loginError, err.message);
  } finally {
    setLoading(el.loginBtn, el.loginBtnText, el.loginBtnLoader, false);
  }
});

el.registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = el.regName.value.trim();
  const password = el.regPassword.value;
  if (!name || !password) {
    showError(el.registerError, t("namePasswordRequired"));
    return;
  }
  setLoading(el.registerBtn, el.registerBtnText, el.registerBtnLoader, true);
  showError(el.registerError, "");
  showSuccess(el.registerSuccess, "");
  try {
    await registerUser(name, password);
    showSuccess(el.registerSuccess, t("accountCreated"));
    el.registerForm.reset();
  } catch (err) {
    showError(el.registerError, err.message);
  } finally {
    setLoading(el.registerBtn, el.registerBtnText, el.registerBtnLoader, false);
  }
});

el.logoutBtn.addEventListener("click", logout);
el.profileLogoutBtn.addEventListener("click", logout);

el.goProfileBtn.addEventListener("click", async () => {
  el.profileUsername.textContent = state.user.name;
  showView("profile");
  showError(el.paymentError, "");
  showError(el.passwordError, "");
  el.passwordForm.reset();
  await loadProfileData();
});

el.goDashboardBtn.addEventListener("click", () => showView("dashboard"));

el.paymentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const paid_at = el.profPaidAt.value;
  const classesPaidEl = document.querySelector(
    'input[name="classes_paid"]:checked',
  );
  if (!paid_at || !classesPaidEl) {
    showError(el.paymentError, t("paymentRequired"));
    return;
  }
  setLoading(el.paymentBtn, el.paymentBtnText, el.paymentBtnLoader, true);
  showError(el.paymentError, "");
  try {
    await apiFetch(`/users/${state.user.id}/payment`, {
      method: "PATCH",
      body: JSON.stringify({
        paid_at,
        classes_paid: parseInt(classesPaidEl.value),
      }),
    });
    await loadStats();
    showToast(t("toastPaymentUpdated"), "success");
  } catch (err) {
    showError(el.paymentError, err.message);
  } finally {
    setLoading(el.paymentBtn, el.paymentBtnText, el.paymentBtnLoader, false);
  }
});

el.passwordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPassword = el.profNewPassword.value;
  const confirmPassword = el.profConfirmPassword.value;
  if (!newPassword || !confirmPassword) {
    showError(el.passwordError, t("bothFieldsRequired"));
    return;
  }
  if (newPassword !== confirmPassword) {
    showError(el.passwordError, t("passwordsNoMatch"));
    return;
  }
  setLoading(el.passwordBtn, el.passwordBtnText, el.passwordBtnLoader, true);
  showError(el.passwordError, "");
  try {
    await apiFetch(`/users/${state.user.id}/password`, {
      method: "PATCH",
      body: JSON.stringify({ password: newPassword }),
    });
    showToast(t("toastPasswordUpdated"), "success");
    el.passwordForm.reset();
    setTimeout(logout, 2500);
  } catch (err) {
    showError(el.passwordError, err.message);
  } finally {
    setLoading(el.passwordBtn, el.passwordBtnText, el.passwordBtnLoader, false);
  }
});

el.quickBtns.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const type = btn.dataset.type;
    btn.classList.add("loading");
    try {
      await registerClass(type, todayString());
      showToast(`${type} — ${t("toastClassRegistered")}`, "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btn.classList.remove("loading");
    }
  });
});

el.calPrev.addEventListener("click", () => {
  state.calMonth--;
  if (state.calMonth < 0) {
    state.calMonth = 11;
    state.calYear--;
  }
  renderCalendar();
});
el.calNext.addEventListener("click", () => {
  state.calMonth++;
  if (state.calMonth > 11) {
    state.calMonth = 0;
    state.calYear++;
  }
  renderCalendar();
});

el.btnOpenRegister.addEventListener("click", openModal);
el.modalClose.addEventListener("click", closeModal);
el.btnCancelRegister.addEventListener("click", closeModal);
el.modalOverlay.addEventListener("click", (e) => {
  if (e.target === el.modalOverlay) closeModal();
});

el.registerClassForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const type = el.classType.value;
  const class_date = el.classDate.value;
  if (!type || !class_date) {
    showError(el.classError, t("typeAndDateRequired"));
    return;
  }
  showError(el.classError, "");
  try {
    await registerClass(type, class_date);
    closeModal();
    showToast(t("toastClassRegistered"), "success");
  } catch (err) {
    showError(el.classError, err.message);
  }
});

el.classesTbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-delete");
  if (!btn) return;
  openConfirm(parseInt(btn.dataset.id));
});

el.confirmCancel.addEventListener("click", closeConfirm);
el.confirmOverlay.addEventListener("click", (e) => {
  if (e.target === el.confirmOverlay) closeConfirm();
});
el.confirmDelete.addEventListener("click", async () => {
  const id = state.pendingDeleteId;
  closeConfirm();
  try {
    await deleteClass(id);
    showToast(t("toastClassDeleted"), "success");
  } catch (err) {
    showToast(err.message, "error");
  }
});

// ── Init ──────────────────────────────────────────────────────
(async () => {
  applyTheme(detectTheme());
  applyLang(detectLang());

  const savedToken = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");
  if (savedToken && savedUser) {
    try {
      const payload = JSON.parse(atob(savedToken.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) throw new Error("expired");
      state.token = savedToken;
      state.user = JSON.parse(savedUser);
      el.dashUsername.textContent = state.user.name;
      state.calYear = new Date().getFullYear();
      state.calMonth = new Date().getMonth();
      showView("dashboard");
      showSkeletons();
      await Promise.all([loadStats(), loadClasses()]);
      hideSkeletons();
    } catch {
      logout();
    }
  } else {
    showView("login");
  }
})();
