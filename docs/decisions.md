# Architecture Decision Records

This file collects architectural decisions made on the danceStudio project.
Each ADR captures the context (why we had to decide something), the decision
itself, the alternatives considered, and the consequences — both the ones we
accepted and the ones we are aware of.

ADRs are append-only. When a decision is superseded, a new ADR is added that
explicitly references and supersedes the older one; the old one is not edited
or deleted.

---

## ADR-001 — Fix IDOR by replacing `/users/:id/*` with `/users/me/*` and taking ownership from the JWT

- **Date:** 2026-04-20
- **Status:** Accepted
- **Related points:** Prioridad Alta, punto 1 of the project improvement plan.

### Context

An audit of the authenticated API surface uncovered Insecure Direct Object
Reference (IDOR) vulnerabilities on every endpoint that accepted a user id
from the client. The `authMiddleware` correctly verified the JWT and populated
`req.user`, but no handler ever compared `req.user.id` against the id supplied
by the client (either via `req.params.id`, `req.params.user_id`, or `req.body.user_id`).

Concretely, before this change:

| Endpoint                                                    | Id source        | Impact if abused                                                                               |
| ----------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| `PATCH /users/:id/password`                                 | URL              | A logged-in user could change any other user's password and deactivate their account.          |
| `PATCH /users/:id/payment`                                  | URL              | Tamper another user's payment date and class quota.                                            |
| `GET /users/:id/profile` and the other `/users/:id/*` reads | URL              | Data exfiltration of name, payment date, plan, class counts.                                   |
| `POST /classes`                                             | Body (`user_id`) | Log a class against another user's account, consuming their quota.                             |
| `GET /classes/user/:user_id`                                | URL              | Read another user's class history.                                                             |
| `DELETE /classes/:id`                                       | URL              | Delete another user's classes. The service only checked the class existed, never who owned it. |

The root cause is the same across all nine endpoints: the identity of the
"subject" of the operation was being read from a client-controlled place
instead of from the verified JWT.

### Decision

1. **For operations on the authenticated user themselves, use `/users/me/*`.**
   Handlers read the id exclusively from `req.user.id`. The client never
   supplies an identifier for these endpoints, so there is nothing to tamper
   with.

2. **For `POST /classes`, take `user_id` from `req.user.id`, not from the body.**
   The request body is reduced to `{ type, class_date }`. Validation no
   longer accepts or requires `user_id`.

3. **For `DELETE /classes/:id`, enforce ownership inside the SQL.**
   The DELETE carries `WHERE id = :id AND user_id = :user_id` and uses
   PostgreSQL's `RETURNING` to report deleted rows. Non-owned or non-existent
   ids both return 404 with the message `"Class not found"`. This avoids
   leaking the existence of class ids that belong to other users.

4. **For listing classes, replace `GET /classes/user/:user_id` with `GET /classes/mine`.**
   Same rationale as `/users/me/*`: no client-supplied id means no tampering.

5. **Admin-only operations (activating accounts, listing users, etc.) are
   explicitly out of scope for this ADR.** When they land, they will live
   under a separate surface (probably `/admin/*`) behind a role-checking
   middleware. They will be the _only_ place where an admin operates on a
   user by id — and the authorization decision will be made by that role
   middleware, not by URL shape.

### Alternatives considered

- **Keep `/users/:id/*` and add an `ensureSelf` middleware** that compares
  `req.user.id === Number(req.params.id)` on every protected route.
  _Rejected_ because the protection would be opt-in per route: any future
  route that forgets the middleware reintroduces the bug. With `/me/*`, the
  protection is structural — no client-supplied id exists to misuse.

- **Query-param scoping (`?user_id=...`) with a guard.**
  Rejected for the same reason: still opt-in, still depends on a guard being
  applied everywhere.

- **Full RBAC/ABAC framework (CASL, accesscontrol, etc.).**
  Rejected for this stage: overkill for two roles (self / admin). We will
  revisit if the role surface grows beyond that.

### Consequences

**Accepted:**

- This is a breaking change to the API. The frontend will need updates in a
  later work item. Because this is a personal/local project with no other
  consumers, the cost is acceptable.
- `AuthRequest` is now defined exactly once, in `middlewares/authMiddleware.ts`,
  and its `user` field is non-optional. A duplicate copy in `types/index.ts`
  — which incorrectly extended the global DOM `Request` instead of the
  Express one — was removed.
- Handlers cast `req` to `AuthRequest` to access `req.user`. This is a
  pragmatic choice given Express's loose typing; a cleaner long-term approach
  is Express's module-augmentation pattern on `Request`, which we can adopt
  if we add more authenticated middlewares.
- `classesService.registerClass` no longer verifies the user exists before
  inserting, because `user_id` now comes from a just-verified JWT. The
  database foreign key remains as a last line of defense.
- `classesService.deleteClass` was renamed to `deleteClassForUser(classId, userId)`
  to make the ownership check an unavoidable part of the function signature.
  There is no longer a function that deletes a class by id alone.

**Not yet addressed (tracked for later points):**

- **Input validation is still hand-rolled.** Planned for Prioridad Alta,
  punto 6 (migrate to Zod).
- **Rate limiting** (punto 2), **helmet** (punto 3), **password recovery
  flow** (punto 4), and **admin panel** (punto 5) are separate work items
  and their own ADRs.
- **JWT revocation.** We still cannot invalidate a leaked token before its
  expiry. Mitigation today: short TTL (8h) and the "change password
  deactivates account" rule. A proper solution (jti denylist, refresh token
  rotation) is out of scope here.

### How to verify the fix

1. Register two users `alice` and `bob`, activate both in the DB.
2. Log in as `alice`, get her JWT.
3. Try the previously-vulnerable operations and confirm they either hit only
   `alice`'s own data (`/me/*`) or return 404 for `bob`'s resources:
   - `GET /users/me/profile` returns `alice`'s profile. There is no way to
     ask for `bob`'s profile via this route.
   - `POST /classes` with `{ type, class_date }` logs a class for `alice`.
     Any `user_id` field in the body is silently ignored.
   - `DELETE /classes/:id` with one of `bob`'s class ids returns 404 — the
     response is indistinguishable from a non-existent id, by design.

---

## ADR-002 — Manual user activation via SQL (no admin endpoint)

- **Date:** 2026-04-22
- **Status:** Accepted

### Context

An admin endpoint (`PATCH /users/:id/activate`) was considered as a replacement
for the manual `UPDATE users SET is_active = true WHERE name = '...'` SQL command
currently used to activate new accounts. This would have required adding a `role`
column to `users` and a `requireAdmin` middleware.

### Decision

Keep manual SQL activation. No admin endpoint will be implemented.

### Reasons

- The app serves at most 10–20 users. The frequency of new account activations
  is very low.
- An admin endpoint would introduce a privileged credential (admin username +
  password) that could be stolen. The current approach requires direct server
  access, which is a stronger security boundary.
- The added complexity (role column, middleware, new endpoint) is not justified
  at this scale.

### Consequences

**Accepted:**

- New users must be activated with a direct SQL command (see CLAUDE.md and README
  for the exact command).
- This is intentional and should not be treated as a bug or a pending refactor.

**Not yet addressed:**

- If the app ever scales to dozens of users or multiple admins, this decision
  should be revisited.

---

## ADR-003 — Password change deactivates account (intentional behavior)

- **Date:** 2026-04-22
- **Status:** Accepted

### Context

The current behavior on `PATCH /users/me/password` sets `is_active = false` after
updating the password. This was flagged as an anti-pattern: ideally, a password
change should verify the current password and not disrupt account access.

### Decision

Keep the current behavior. Password change continues to deactivate the account.

### Reasons

- With fewer than 20 users, manual reactivation via SQL is not a real operational
  cost.
- The deactivation acts as an implicit confirmation step: the studio owner reviews
  and reactivates, ensuring no unauthorized password changes go unnoticed.
- Implementing "verify current password before changing" adds complexity without
  meaningful benefit at this scale.

### Consequences

**Accepted:**

- After a password change, the user must contact the studio owner to be reactivated.
- This is intentional and should not be treated as a bug or a pending refactor.

**Not yet addressed:**

- If self-service password recovery becomes necessary in the future, this decision
  should be revisited with a proper flow (e.g. email verification, current-password
  confirmation).

---

## ADR-004 — Rate limiting on login and all API routes

- **Date:** 2026-04-23
- **Status:** Accepted

### Context

`POST /auth/login` had no request throttling. A single attacker could perform
unlimited login attempts from one IP, making brute-force attacks against user
passwords trivially cheap. bcrypt's cost factor provides some natural slowdown,
but is not sufficient on its own.

### Decision

Add `express-rate-limit` with two independent limiters:

| Limiter | Scope | Window | Max requests |
|---|---|---|---|
| `loginLimiter` | `POST /auth/login` | 15 min | 10 |
| `globalLimiter` | All routes | 1 min | 100 |

Both limiters expose standard `RateLimit-*` headers (`standardHeaders: true`)
and suppress the deprecated `X-RateLimit-*` headers (`legacyHeaders: false`).

`app.set('trust proxy', 1)` is set so that Express reads the real client IP
from the `X-Forwarded-For` header forwarded by nginx, instead of always seeing
the nginx container IP.

### Alternatives considered

- **Per-username lockout (in addition to per-IP).** Would protect against
  distributed attacks where a single target account is hit from many IPs.
  Rejected at this stage: requires storing failed-attempt counters in the DB
  or a Redis cache, which is significant complexity for a ≤20-user studio.
  Can be revisited if the threat model changes.

- **Exponential backoff / progressive delay.** More user-friendly than a hard
  block, but harder to implement correctly with a stateless in-memory store.
  Not justified at this scale.

- **Block at nginx level.** Possible, but would require nginx config changes
  and moves the concern out of the application layer where it is easier to
  reason about and test.

### Consequences

**Accepted:**

- Brute-force from a single IP is limited to 10 attempts per 15-minute window
  on the login endpoint.
- Distributed brute-force (different IPs, same account) is **not** mitigated.
  For a ≤20-user studio this is an accepted residual risk.
- The in-memory rate-limit store resets on backend restart. This is acceptable:
  the studio runs as a single container, restarts are infrequent, and a
  persistent store (Redis) would be over-engineered here.
- All legitimate users share the global 100 req/min cap, which is well above
  normal usage patterns for this app.

**Not yet addressed:**

- Body validation with Zod (backlog item 6) is a separate work item.

---

## ADR-005 — HTTP security headers via helmet

- **Date:** 2026-04-23
- **Status:** Accepted

### Context

The Express backend returned no HTTP security headers beyond the ones added by
Express itself. This left the API exposed to a range of well-known header-based
attacks: MIME-type sniffing, clickjacking, unintended cross-origin resource
sharing, and missing transport security enforcement.

### Decision

Add `helmet` as the first middleware in `app.ts`. `contentSecurityPolicy` is
disabled because the backend is a pure JSON API — it serves no HTML and has no
inline scripts or styles. CSP is the responsibility of the nginx frontend.

Headers applied by default in this configuration:

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Blocks clickjacking |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Enforces HTTPS |
| `Referrer-Policy` | `no-referrer` | Suppresses Referer header leakage |
| `X-DNS-Prefetch-Control` | `off` | Prevents DNS prefetch information leakage |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolates browsing context |
| `Cross-Origin-Resource-Policy` | `same-origin` | Restricts cross-origin resource reads |
| `Origin-Agent-Cluster` | `?1` | Enables origin-keyed agent clustering |
| `X-XSS-Protection` | `0` | Disabled — modern browsers ignore it and it can introduce vulnerabilities |

### Alternatives considered

- **Set headers manually.** More control but error-prone and hard to maintain.
  helmet is the maintained standard for Express.
- **Enable CSP on the backend.** Unnecessary for a JSON API and would likely
  break legitimate browser behavior. Deferred to nginx for the frontend.

### Consequences

**Accepted:**

- `contentSecurityPolicy` is disabled on the backend. The frontend nginx config
  should set its own CSP (tracked in backlog item 23).
- `Strict-Transport-Security` is sent even in local HTTP development. This has
  no practical effect locally but would enforce HTTPS once the app is deployed
  behind TLS.

**Not yet addressed:**

- CSP, `X-Frame-Options`, and other security headers for the nginx frontend
  (backlog item 23).

---

## ADR-006 — Body validation with Zod on all endpoints

- **Date:** 2026-04-24
- **Status:** Accepted
- **Related points:** Backlog item 6 (Security).

### Context

All endpoints that accept a request body (POST, PATCH) had validation
implemented ad-hoc inside individual middleware functions in
`validateMiddleware.ts`. Each function repeated the same pattern: manual type
checks, regex tests, and early `res.status(400)` returns. This was
error-prone, inconsistent across endpoints, and hard to extend. Notably:

- `POST /auth/login` validated `name` and `password` inline in the controller
  (no dedicated middleware at all).
- `PATCH /users/me/password` validated `password` inline in the controller.
- `classes_paid` accepted `0, 12, 15` on registration but only `12, 15` on
  payment update — an unintentional inconsistency.
- No validation produced structured, machine-readable errors; all 400 responses
  were plain `{ message: string }` objects.

### Decision

Replace all ad-hoc validation with [Zod](https://zod.dev/), a TypeScript-first
schema validation library. The implementation follows two principles:

1. **A single generic middleware factory** (`validate(schema, target)`) in
   `middlewares/validateMiddleware.ts` handles all endpoints. `target` defaults
   to `'body'`; `'params'` is used for URL parameter validation (e.g.
   `DELETE /classes/:id`).

2. **Schemas live next to their feature**, not in a shared folder, following the
   feature-first convention of the project:

   | File | Schemas |
   |---|---|
   | `features/auth/authSchemas.ts` | `loginSchema` |
   | `features/users/usersSchemas.ts` | `registerUserSchema`, `updatePasswordSchema`, `updatePaymentSchema` |
   | `features/classes/classesSchemas.ts` | `registerClassSchema`, `classIdParamSchema` |

Inferred TypeScript types (`z.infer<typeof schema>`) are available from each
schema file, eliminating the need to maintain separate interface definitions for
request bodies.

Additionally, the `classes_paid` inconsistency was corrected: both registration
and payment update now accept only `12 | 15`. Registration defaults to `12` when
the field is omitted.

### Alternatives considered

- **Joi.** Older and battle-tested, but TypeScript support is bolted on rather
  than native. It would require maintaining separate TypeScript interfaces
  alongside the Joi schemas. Rejected in favor of Zod's first-class TypeScript
  integration.

- **Keep hand-rolled validation.** Zero new dependencies, but the existing code
  was already inconsistent and growing harder to maintain. Any new endpoint
  would add yet another bespoke validator. Rejected.

- **class-validator + class-transformer.** Decorator-based, requires
  `experimentalDecorators` in `tsconfig.json`. More ceremony for no benefit at
  this scale. Rejected.

### Consequences

**Accepted:**

- Zod is added as a production dependency.
- Validation error responses change shape: from `{ message: string }` to
  `{ errors: ZodIssue[] }`. Clients (currently only the frontend) must be
  updated to handle this format.
- `(req as any)[target] = result.data` is used to write the coerced/stripped
  data back onto the request. This is necessary because Express types
  `req.params` as `Record<string, string>`, which conflicts with Zod's coerced
  output (e.g. `{ id: number }`). The cast is isolated to one line in the
  factory.
- URL param `id` in `DELETE /classes/:id` is now coerced from string to number
  by Zod before reaching the controller. The existing `Number(req.params.id)`
  call in the controller is now redundant but harmless.

**Not yet addressed:**

- The frontend error-handling layer should be updated to display structured Zod
  errors (backlog item 7 area).
- CSP, `X-Frame-Options`, and other security headers for the nginx frontend
  (backlog item 23).
