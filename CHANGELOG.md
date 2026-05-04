# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-05-03

### Added
- Initial dance class registration system for bachata, salsa, and cumbia
- Student registration and authentication with JWT
- Dashboard showing classes taken, classes remaining, and days until next payment
- Class history per user with the ability to register and delete classes
- Payment tracking: packages of 12 or 15 classes, monthly billing cycle
- User profile endpoint
- Internationalization (Spanish / English)
- Dark mode support
- Full TypeScript migration on both backend (Express + Sequelize) and frontend (Vanilla TS + esbuild)
- Dockerized infrastructure with Docker Compose (PostgreSQL, backend, frontend/nginx)
- Production deployment configuration for Railway

### Security
- JWT storage migrated from `localStorage` to `httpOnly` cookie to prevent XSS token theft (ADR-007)
- IDOR vulnerabilities closed on user and class endpoints — all routes scoped to the authenticated user (ADR-001)
- Rate limiting applied to login endpoint and global routes (ADR-004)
- HTTP security headers added via Helmet (ADR-005)
- Request body validation with Zod on all endpoints (ADR-006)
- `SameSite=None` cookie attribute set in production to support cross-origin requests (ADR-008)
- Automatic redirect to login when auth cookie is expired or missing

### Fixed
- Date picker color in dark mode
- Days remaining display text
- Maximum selectable date in date picker
- CORS configuration for local development

[1.0.0]: https://github.com/juancarlosSH/danceStudio/releases/tag/v1.0.0
