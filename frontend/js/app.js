const API_URL = window.ENV_API_URL || "http://localhost:3000";

// ── State ────────────────────────────────────────────────────
const state = {
  token: null,
  user: null,
  classes: [],
  pendingDeleteId: null,
};

// ── DOM refs ─────────────────────────────────────────────────
const views = {
  login: document.getElementById("view-login"),
  dashboard: document.getElementById("view-dashboard"),
};

const el = {
  loginForm: document.getElementById("login-form"),
  loginName: document.getElementById("login-name"),
  loginPassword: document.getElementById("login-password"),
  loginError: document.getElementById("login-error"),
  loginBtn: document.getElementById("login-btn"),
  loginBtnText: document.querySelector("#login-btn .btn-text"),
  loginBtnLoader: document.querySelector("#login-btn .btn-loader"),

  dashUsername: document.getElementById("dash-username"),
  logoutBtn: document.getElementById("logout-btn"),

  cardTaken: document.getElementById("card-taken"),
  cardRemaining: document.getElementById("card-remaining"),
  cardDays: document.getElementById("card-days"),
  statTaken: document.getElementById("stat-taken"),
  statRemaining: document.getElementById("stat-remaining"),
  statDays: document.getElementById("stat-days"),

  btnOpenRegister: document.getElementById("btn-open-register"),
  btnCancelRegister: document.getElementById("btn-cancel-register"),
  modalOverlay: document.getElementById("modal-overlay"),
  modalClose: document.getElementById("modal-close"),
  registerForm: document.getElementById("register-class-form"),
  classType: document.getElementById("class-type"),
  classDate: document.getElementById("class-date"),
  classError: document.getElementById("class-error"),

  confirmOverlay: document.getElementById("confirm-overlay"),
  confirmCancel: document.getElementById("confirm-cancel"),
  confirmDelete: document.getElementById("confirm-delete"),

  classesTbody: document.getElementById("classes-tbody"),
  classesEmptyRow: document.getElementById("classes-empty-row"),
  classesCount: document.getElementById("classes-count"),
  skeletonRows: document.querySelectorAll(".skeleton-row"),

  toast: document.getElementById("toast"),
};

// ── View switching ───────────────────────────────────────────
function showView(name) {
  Object.values(views).forEach((v) => {
    v.classList.add("hidden");
    v.classList.remove("active");
  });
  views[name].classList.remove("hidden");
  views[name].classList.add("active");
}

// ── Toast ────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = "success") {
  el.toast.textContent = msg;
  el.toast.className = `toast ${type}`;
  el.toast.classList.remove("hidden");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.add("hidden"), 3000);
}

// ── Register modal ───────────────────────────────────────────
function openModal() {
  el.classDate.valueAsDate = new Date();
  el.modalOverlay.classList.remove("hidden");
}
function closeModal() {
  el.modalOverlay.classList.add("hidden");
  el.registerForm.reset();
  showError(el.classError, "");
}

// ── Confirm modal ────────────────────────────────────────────
function openConfirm(id) {
  state.pendingDeleteId = id;
  el.confirmOverlay.classList.remove("hidden");
}
function closeConfirm() {
  state.pendingDeleteId = null;
  el.confirmOverlay.classList.add("hidden");
}

// ── Skeleton ─────────────────────────────────────────────────
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

// ── Alert states on cards ────────────────────────────────────
function applyCardAlerts(remaining, days) {
  el.cardRemaining.classList.remove("alert-warning", "alert-danger");
  el.cardDays.classList.remove("alert-warning", "alert-danger");
  if (remaining <= 0) el.cardRemaining.classList.add("alert-danger");
  else if (remaining <= 3) el.cardRemaining.classList.add("alert-warning");
  if (days <= 0) el.cardDays.classList.add("alert-danger");
  else if (days <= 5) el.cardDays.classList.add("alert-warning");
}

// ── Auth ─────────────────────────────────────────────────────
async function login(name, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
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

// ── API helpers ──────────────────────────────────────────────
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

// ── Stats ────────────────────────────────────────────────────
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

// ── Classes ──────────────────────────────────────────────────
async function loadClasses() {
  const data = await apiFetch(`/classes/user/${state.user.id}`);
  state.classes = data;
  renderClasses();
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
  await loadStats();
}

async function deleteClass(id) {
  await apiFetch(`/classes/${id}`, { method: "DELETE" });
  state.classes = state.classes.filter((c) => c.id !== id);
  renderClasses();
  await loadStats();
}

// ── Utilities ────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function showError(elRef, msg) {
  elRef.textContent = msg;
  msg ? elRef.classList.remove("hidden") : elRef.classList.add("hidden");
}

function setLoginLoading(loading) {
  el.loginBtnText.classList.toggle("hidden", loading);
  el.loginBtnLoader.classList.toggle("hidden", !loading);
  el.loginBtn.disabled = loading;
}

// ── Event listeners ──────────────────────────────────────────
el.loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = el.loginName.value.trim();
  const password = el.loginPassword.value;
  if (!name || !password) {
    showError(el.loginError, "Name and password are required");
    return;
  }
  setLoginLoading(true);
  showError(el.loginError, "");
  try {
    const { token } = await login(name, password);
    state.token = token;
    const payload = JSON.parse(atob(token.split(".")[1]));
    state.user = { id: payload.id, name: payload.name };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(state.user));
    el.dashUsername.textContent = state.user.name;
    showView("dashboard");
    showSkeletons();
    await Promise.all([loadStats(), loadClasses()]);
    hideSkeletons();
  } catch (err) {
    showError(el.loginError, err.message);
  } finally {
    setLoginLoading(false);
  }
});

el.logoutBtn.addEventListener("click", logout);

el.btnOpenRegister.addEventListener("click", openModal);
el.modalClose.addEventListener("click", closeModal);
el.btnCancelRegister.addEventListener("click", closeModal);
el.modalOverlay.addEventListener("click", (e) => {
  if (e.target === el.modalOverlay) closeModal();
});

el.registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const type = el.classType.value;
  const class_date = el.classDate.value;
  if (!type || !class_date) {
    showError(el.classError, "Type and date are required");
    return;
  }
  showError(el.classError, "");
  try {
    await registerClass(type, class_date);
    closeModal();
    showToast("Class registered successfully", "success");
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
    showToast("Class deleted", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
});

// ── Init: restore session ────────────────────────────────────
(async () => {
  const savedToken = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");
  if (savedToken && savedUser) {
    try {
      const payload = JSON.parse(atob(savedToken.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) throw new Error("expired");
      state.token = savedToken;
      state.user = JSON.parse(savedUser);
      el.dashUsername.textContent = state.user.name;
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
