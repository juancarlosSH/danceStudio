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

### API

1. **Validate real calendar dates, not only `YYYY-MM-DD` format**: reject impossible dates such as `2026-02-31` with `400` instead of letting PostgreSQL raise an internal error.
2. **Consolidate dashboard endpoints**: `/users/me/dashboard` returning `classesTaken`, `classesRemaining`, `daysRemaining` in a single call.
3. **Versioning**: `/api/v1/` prefix on all routes.
4. **`/health` endpoint** for backend healthcheck.

### Database

5. **Enforce unique usernames in the database**: add a unique constraint or unique index on `users.name` so concurrent registrations cannot create duplicate usernames.
6. **Composite index for dashboard/history queries**: add an index on `dance_classes(user_id, class_date)`; the current schema only has single-column indexes.
7. **Soft deletes** on `classes` (`deleted_at` column).
8. **Index** on `classes(user_id, date)` if missing.
9. **`plans` table** if flexibility beyond 12/15 classes is needed.

### Testing / DX

10. **Unit tests** for date logic (classes taken, remaining, days).
11. **Integration tests** with supertest.
12. **GitHub Actions** with `npm test` and `npm run build`.
13. **OpenAPI/Swagger** generated from code.

### Product

14. Admin view (list students, overdue payments, etc.).
15. Export history to CSV/PDF.
16. Notifications when N days remain until payment.

### Infrastructure

17. **Align backend port configuration**: make backend runtime honor the documented `BACKEND_PORT` variable, or document `PORT` as the real runtime variable, so local and Docker behavior match.
18. Multi-stage builds in Dockerfiles.
19. Remove `version: "3.9"` from `docker-compose.yml` (deprecated).
20. Security headers in nginx config (CSP, X-Frame-Options).
21. Don't expose backend port 3000 in production.

### Repo

22. Add `LICENSE`.
23. Screenshots in README.
24. Tags and CHANGELOG.
