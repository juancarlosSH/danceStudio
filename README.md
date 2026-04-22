# Dance Studio

A class registration system for dance studios. Students can register, log their classes, and track their progress — while the studio owner manages accounts directly from the database.

## Features

- **Authentication** — JWT-based login. Accounts are activated manually by the admin directly in the database, preventing unauthorized access.
- **Class registration** — Quick-register buttons for Bachata, Salsa and Cumbia log a class instantly with today's date. A manual form allows registering classes on past dates.
- **Dashboard stats** — Cards showing classes taken since last payment, classes remaining, and days until next payment. Cards turn yellow or red when values are low.
- **Monthly calendar** — Visual calendar showing registered classes as colored dots per dance type.
- **Class history** — Full table of registered classes with delete functionality and confirmation modal.
- **Profile** — Update payment date, classes paid (12 or 15), and password. Changing the password deactivates the account until the admin reactivates it.
- **Dark mode** — Follows system preference on first load, togglable from the header.
- **Bilingual** — Spanish and English support with automatic browser language detection, togglable from the header.
- **Responsive** — Optimized for mobile, tablet, and laptop.

---

## Tech Stack & Architecture

This project is structured as microservices, each with its own Dockerfile and managed via a single `docker-compose.yml`.

```
danceClassRegistration/
├── docker-compose.yml
├── .env
├── db/
│   └── init.sql
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── app.ts
│   │   ├── config/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   └── classes/
│   │   ├── middlewares/
│   │   └── types/
│   └── tsconfig.json
└── frontend/
    ├── Dockerfile
    ├── build.mjs
    ├── src/
    │   ├── app.ts
    │   ├── components/
    │   ├── views/
    │   ├── services/
    │   ├── state/
    │   ├── i18n/
    │   ├── types/
    │   └── styles/
    └── tsconfig.json
```

| Layer          | Technology                                   |
| -------------- | -------------------------------------------- |
| Database       | PostgreSQL 16                                |
| Backend        | Node.js, Express, TypeScript, Sequelize, JWT |
| Frontend       | Vanilla TypeScript, esbuild, nginx           |
| Infrastructure | Docker, Docker Compose                       |

---

## Environment Variables

Create a `.env` file at the project root (copy from the example below):

```env
DB_HOST=db
DB_PORT=5432
DB_NAME=dance_registration
DB_USER=dance_user
DB_PASSWORD=dance_password

BACKEND_PORT=3000
CORS_ORIGIN=http://localhost:8080

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=8h

FRONTEND_PORT=8080
```

> For local development without Docker, change `DB_HOST=db` to `DB_HOST=localhost`.

---

## Running with Docker (recommended)

Requires: [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

```bash
# Clone the repository
git clone https://github.com/juancarlosSH/danceClassRegistration.git
cd danceClassRegistration

# Create the .env file
cp .env.example .env  # or create it manually

# Build and start all services
docker-compose up -d --build
```

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:8080 |
| Backend API | http://localhost:3000 |
| PostgreSQL  | localhost:5432        |

To stop all services:

```bash
docker-compose down
```

---

## Local Development (per service)

### Database

Start only the database container:

```bash
docker-compose up -d db
```

### Backend

Requires: Node.js 20+

```bash
cd backend
npm install
npm run dev
```

The server starts at `http://localhost:3000` with hot reload via `ts-node-dev`.

> Make sure `DB_HOST=localhost` in your `.env` when running the backend outside Docker.

### Frontend

Requires: Node.js 20+

```bash
cd frontend
npm install
npm run build   # compiles TS and bundles to dist/
```

To serve the compiled output locally:

```bash
npx http-server dist -p 8080 --cors
```

The app will be available at `http://localhost:8080`.

---

## Activating a User Account

After a user registers, an admin must activate the account directly in the database:

```bash
docker exec -it dance_db psql -U dance_user -d dance_registration -c \
  "UPDATE users SET is_active = true WHERE name = 'username';"
```

---

## API Endpoints

| Method | Endpoint                        | Auth | Description                           |
| ------ | ------------------------------- | ---- | ------------------------------------- |
| POST   | `/auth/login`                   | ❌   | Login                                 |
| POST   | `/users`                        | ❌   | Register user                         |
| PATCH  | `/users/me/password`            | ✅   | Update password (deactivates account) |
| PATCH  | `/users/me/payment`             | ✅   | Update payment date and classes paid  |
| GET    | `/users/me/classes-taken`       | ✅   | Classes taken since payment date      |
| GET    | `/users/me/classes-remaining`   | ✅   | Classes remaining                     |
| GET    | `/users/me/days-remaining`      | ✅   | Days until next payment               |
| GET    | `/users/me/profile`             | ✅   | User profile data                     |
| POST   | `/classes`                      | ✅   | Register a class                      |
| GET    | `/classes/mine`                 | ✅   | Class history for the authenticated user |
| DELETE | `/classes/:id`                  | ✅   | Delete a class                        |
