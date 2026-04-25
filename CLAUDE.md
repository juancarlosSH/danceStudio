# Dance Studio

A class registration system for a dance studio. Students register, log their classes, and track their progress. The studio owner manages accounts directly.

---

## Tech Stack

| Layer          | Technology                                       |
| -------------- | ------------------------------------------------ |
| Database       | PostgreSQL 16                                    |
| Backend        | Node.js 20+, Express, TypeScript, Sequelize, JWT |
| Frontend       | Vanilla TypeScript, esbuild, nginx               |
| Infrastructure | Docker, Docker Compose                           |

---

## Project Structure

danceStudio/
├── docker-compose.yml
├── .env
├── db/
│ └── init.sql # Initial PostgreSQL schema
├── backend/
│ ├── Dockerfile
│ ├── src/
│ │ ├── app.ts # Express entry point
│ │ ├── config/ # DB, JWT, etc. config
│ │ ├── features/ # Organized by domain, NOT by layer
│ │ │ ├── auth/
│ │ │ ├── users/
│ │ │ └── classes/
│ │ ├── middlewares/
│ │ └── types/
│ └── tsconfig.json
└── frontend/
├── Dockerfile
├── build.mjs # esbuild script
├── src/
│ ├── app.ts
│ ├── components/
│ ├── views/
│ ├── services/ # API calls
│ ├── state/ # Global client state
│ ├── i18n/ # ES / EN
│ ├── types/
│ └── styles/
└── tsconfig.json

---

## Domain Model

- **users**: student account. Relevant fields: `id`, `name`, `password`, `is_active`, `payment_date`, `classes_paid` (12 or 15).
- **classes**: registered class. Fields: `id`, `user_id`, `type` (bachata | salsa | cumbia), `date`.
- Relationship: `users` 1 — N `classes`.

---

## Business Rules

- Accounts are created inactive. The studio owner activates them with `UPDATE users SET is_active = true` directly in the DB. **This is an intentional design decision** — see ADR-002.
- Changing the password **deactivates the account**. **This is an intentional design decision** — see ADR-003.
- "Classes taken" is counted from the last `payment_date`.
- "Classes remaining" = `classes_paid` − classes taken since payment.
- "Days remaining" = days until the next payment date (payment_date + 30 days, monthly billing).
- Packages are 12 or 15 classes, hardcoded. If flexibility is needed in the future, consider a `plans` table.

---

## API Endpoints

| Method | Endpoint                      | Auth | Description                              |
| ------ | ----------------------------- | ---- | ---------------------------------------- |
| POST   | `/auth/login`                 | ❌   | Login                                    |
| POST   | `/users`                      | ❌   | Register user (starts inactive)          |
| PATCH  | `/users/me/password`          | ✅   | Change password (deactivates account)    |
| PATCH  | `/users/me/payment`           | ✅   | Update payment date and classes paid     |
| GET    | `/users/me/classes-taken`     | ✅   | Classes taken since payment date         |
| GET    | `/users/me/classes-remaining` | ✅   | Classes remaining                        |
| GET    | `/users/me/days-remaining`    | ✅   | Days until next payment                  |
| GET    | `/users/me/profile`           | ✅   | User profile                             |
| POST   | `/classes`                    | ✅   | Register a class                         |
| GET    | `/classes/mine`               | ✅   | Class history for the authenticated user |
| DELETE | `/classes/:id`                | ✅   | Delete a class                           |

---

## Useful Commands

### Docker (recommended flow)

```bash
docker-compose up -d --build       # Start everything
docker-compose down                # Stop
docker-compose logs -f backend     # View backend logs
docker-compose logs -f db          # View DB logs
```

### Backend (local development without Docker)

```bash
cd backend
npm install
npm run dev                        # Hot reload with ts-node-dev
```

> Requires `DB_HOST=localhost` in `.env`.

### Frontend (local development)

```bash
cd frontend
npm install
npm run build
npx http-server dist -p 8080 --cors
```

### Database

```bash
# Connect to the postgres container
docker exec -it dance_db psql -U dance_user -d dance_registration

# Activate a user manually (intentional — see ADR-002)
docker exec -it dance_db psql -U dance_user -d dance_registration -c \
  "UPDATE users SET is_active = true WHERE name = 'username';"
```

---

## Environment Variables

The project uses a single `.env` at the root:

```env
DB_HOST=db
DB_PORT=5432
DB_NAME=dance_registration
DB_USER=dance_user
DB_PASSWORD=dance_password
BACKEND_PORT=3000
CORS_ORIGIN=http://localhost:8080
JWT_SECRET=...
JWT_EXPIRES_IN=8h
FRONTEND_PORT=8080
```

---

## Code Conventions

- **Strict TypeScript** in both backend and frontend.
- **Feature-first organization, not layer-first.** Each feature has its router, controller, service, and model in the same folder.
- **Sequelize** for ORM — avoid raw SQL queries unless strongly justified.
- **JWT** in `Authorization: Bearer <token>` header.
- **RESTful endpoints** following `/resource/:id/subresource` pattern.
- **Commits in English**, short and descriptive.

---

## Workflow with Claude

- **Always show me a plan before making changes.** Do not apply edits without my approval first, even for small changes.
- Use Plan mode by default.
- When finishing a task, tell me which files you touched and why.
- If you spot something I didn't ask about but that looks wrong (bug, smell, inconsistency), mention it at the end but don't fix it without asking.
- Before installing new dependencies, justify why and wait for approval.
- For changes touching multiple files, break down the plan file by file.

---

## Known Backlog (improvement items)

Prioritized from highest to lowest urgency. Address them as they come up in conversation:

### Security

1. ~~**Fix IDOR**~~: resolved — `/users/:id/*` routes replaced by `/users/me/*` and `user_id` taken from JWT. See ADR-001 in `docs/decisions.md`.
2. ~~**Admin endpoint to activate accounts**~~: intentional business decision — manual SQL activation is kept. See ADR-002 in `docs/decisions.md`.
3. ~~**Password change without deactivating account**~~: intentional business decision — deactivation on password change is kept. See ADR-003 in `docs/decisions.md`.
4. ~~**Rate limiting**~~: resolved — `loginLimiter` (10 req / 15 min) on `/auth/login` and `globalLimiter` (100 req / 1 min) on all routes. `trust proxy` enabled for nginx. See ADR-004 in `docs/decisions.md`.
5. ~~**`helmet()`**~~: resolved — mounted as first middleware with `contentSecurityPolicy` disabled (pure JSON API). See ADR-005 in `docs/decisions.md`.
6. ~~**Body validation** with `zod` on all endpoints~~: resolved — generic `validate(schema, target)` factory with per-feature Zod schemas. `classes_paid` normalized to `12 | 15` only, default `12` on registration. See ADR-006 in `docs/decisions.md`.
7. ~~**Review JWT storage** in the frontend~~: resolved — JWT moved to an `httpOnly`, `SameSite=strict` cookie set by the server. `localStorage` no longer holds the token. `POST /auth/logout` clears the cookie. Cookie lifetime is derived from `JWT_EXPIRES_IN`. See ADR-007 in `docs/decisions.md`.

### API

8. **Consolidate dashboard endpoints**: `/users/me/dashboard` returning `classesTaken`, `classesRemaining`, `daysRemaining` in a single call.
9. **Versioning**: `/api/v1/` prefix on all routes.
10. **`/health` endpoint** for backend healthcheck.

### Database

11. **Soft deletes** on `classes` (`deleted_at` column).
12. **Index** on `classes(user_id, date)` if missing.
13. **`plans` table** if flexibility beyond 12/15 classes is needed.

### Testing / DX

14. **Unit tests** for date logic (classes taken, remaining, days).
15. **Integration tests** with supertest.
16. **GitHub Actions** with `npm test` and `npm run build`.
17. **OpenAPI/Swagger** generated from code.

### Product

18. Admin view (list students, overdue payments, etc.).
19. Export history to CSV/PDF.
20. Notifications when N days remain until payment.

### Infrastructure

21. Multi-stage builds in Dockerfiles.
22. Remove `version: "3.9"` from `docker-compose.yml` (deprecated).
23. Security headers in nginx config (CSP, X-Frame-Options).
24. Don't expose backend port 3000 in production.

### Repo

25. Add `LICENSE`.
26. Screenshots in README.
27. Tags and CHANGELOG.
