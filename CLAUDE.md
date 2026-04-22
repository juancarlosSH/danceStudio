# Dance Studio

Sistema de registro de clases para un estudio de danza. Los alumnos se registran, logean sus clases y tracking de progreso. El dueño del estudio administra cuentas.

---

## Stack Tecnológico

| Capa            | Tecnología                                       |
| --------------- | ------------------------------------------------ |
| Base de datos   | PostgreSQL 16                                    |
| Backend         | Node.js 20+, Express, TypeScript, Sequelize, JWT |
| Frontend        | Vanilla TypeScript, esbuild, nginx               |
| Infraestructura | Docker, Docker Compose                           |

---

## Estructura del proyecto

danceStudio/
├── docker-compose.yml
├── .env
├── db/
│ └── init.sql # Schema inicial de PostgreSQL
├── backend/
│ ├── Dockerfile
│ ├── src/
│ │ ├── app.ts # Entry point de Express
│ │ ├── config/ # Config de DB, JWT, etc.
│ │ ├── features/ # Organizado por dominio, NO por capas
│ │ │ ├── auth/
│ │ │ ├── users/
│ │ │ └── classes/
│ │ ├── middlewares/
│ │ └── types/
│ └── tsconfig.json
└── frontend/
├── Dockerfile
├── build.mjs # Script de build con esbuild
├── src/
│ ├── app.ts
│ ├── components/
│ ├── views/
│ ├── services/ # Llamadas a la API
│ ├── state/ # Estado global del cliente
│ ├── i18n/ # ES / EN
│ ├── types/
│ └── styles/
└── tsconfig.json

---

## Modelo de dominio

- **users**: cuenta del alumno. Campos relevantes: `id`, `name`, `password`, `is_active`, `payment_date`, `classes_paid` (12 o 15), `role` (actualmente no existe, probablemente hay que añadirlo).
- **classes**: clase registrada. Campos: `id`, `user_id`, `type` (bachata | salsa | cumbia), `date`.
- Relación: `users` 1 — N `classes`.

---

## Reglas de negocio importantes

- Las cuentas se crean inactivas. **Actualmente** un admin las activa haciendo `UPDATE users SET is_active = true` directamente en la BD (esto es un pendiente a refactorizar).
- Cambiar la contraseña **desactiva la cuenta** (también es un anti-patrón a revisar).
- "Clases tomadas" se cuenta desde la última `payment_date`.
- "Clases restantes" = `classes_paid` − clases tomadas desde el pago.
- "Días restantes" = días hasta la siguiente fecha de pago (payment_date + 30 días, asumiendo mensualidad).
- Los paquetes son 12 o 15 clases, hardcodeado. Si se vuelve flexible, considerar tabla `plans`.

---

## API Endpoints

| Método | Endpoint                        | Auth | Descripción                               |
| ------ | ------------------------------- | ---- | ----------------------------------------- |
| POST   | `/auth/login`                   | ❌   | Login                                     |
| POST   | `/users`                        | ❌   | Registrar usuario (queda inactivo)        |
| PATCH  | `/users/me/password`            | ✅   | Cambiar contraseña (desactiva cuenta)     |
| PATCH  | `/users/me/payment`             | ✅   | Actualizar fecha de pago y clases pagadas |
| GET    | `/users/me/classes-taken`       | ✅   | Clases tomadas desde el pago              |
| GET    | `/users/me/classes-remaining`   | ✅   | Clases restantes                          |
| GET    | `/users/me/days-remaining`      | ✅   | Días hasta próximo pago                   |
| GET    | `/users/me/profile`             | ✅   | Perfil del usuario                        |
| POST   | `/classes`                      | ✅   | Registrar clase                           |
| GET    | `/classes/mine`                 | ✅   | Historial de clases del usuario autenticado |
| DELETE | `/classes/:id`                  | ✅   | Borrar clase                              |

---

## Comandos útiles

### Docker (flujo recomendado)

```bash
docker-compose up -d --build       # Levantar todo
docker-compose down                # Apagar
docker-compose logs -f backend     # Ver logs del backend
docker-compose logs -f db          # Ver logs de la BD
```

### Backend (desarrollo local sin Docker)

```bash
cd backend
npm install
npm run dev                        # Hot reload con ts-node-dev
```

> Requiere `DB_HOST=localhost` en el `.env`.

### Frontend (desarrollo local)

```bash
cd frontend
npm install
npm run build
npx http-server dist -p 8080 --cors
```

### Base de datos

```bash
# Conectarse al postgres del contenedor
docker exec -it dance_db psql -U dance_user -d dance_registration

# Activar usuario manualmente (pendiente por refactorizar)
docker exec -it dance_db psql -U dance_user -d dance_registration -c \
  "UPDATE users SET is_active = true WHERE name = 'username';"
```

---

## Variables de entorno

El proyecto usa un único `.env` en la raíz:
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

---

## Convenciones de código

- **TypeScript estricto** en backend y frontend.
- **Organización por features, no por capas.** Cada feature tiene su router, controller, service y model en la misma carpeta.
- **Sequelize** para ORM — evitar queries SQL raw salvo casos muy justificados.
- **JWT** en header `Authorization: Bearer <token>`.
- **Endpoints RESTful** con patrón `/recurso/:id/subrecurso`.
- **Commits en inglés**, mensajes cortos y descriptivos.

---

## Flujo de trabajo con Claude

- **Siempre muéstrame un plan antes de hacer cambios.** No apliques ediciones sin que haya aprobado el plan primero, incluso si parecen cambios pequeños.
- Usa modo Plan por defecto.
- Al terminar una tarea, dime qué archivos tocaste y por qué.
- Si detectas algo que no te pedí pero está mal (bug, smell, inconsistencia), menciónalo al final pero no lo arregles sin preguntar.
- Antes de instalar dependencias nuevas, justifica por qué y espera aprobación.
- Para cambios que toquen múltiples archivos, desglosa el plan archivo por archivo.

---

## Pendientes conocidos (backlog de mejoras)

Priorizados de mayor a menor urgencia. Puedes atacarlos conforme vayan surgiendo en la conversación:

### Seguridad

1. ~~**Fix IDOR**~~: resuelto — rutas `/users/:id/*` reemplazadas por `/users/me/*` y `user_id` tomado del JWT. Ver ADR-001 en `docs/decisions.md`.
2. **Endpoint admin** para activar cuentas (`PATCH /users/:id/activate`) que reemplace el `UPDATE` manual en SQL. Requiere agregar `role` a `users` y middleware `requireAdmin`.
3. **Cambio de contraseña sin desactivar cuenta**: pedir contraseña actual en lugar de desactivar.
4. **Rate limiting** con `express-rate-limit`, especialmente en `/auth/login`.
5. **`helmet()`** en el backend.
6. **Validación de bodies** con `zod` (o `joi`) en todos los endpoints.
7. **Revisar almacenamiento del JWT** en el frontend (si está en `localStorage`, considerar `httpOnly` cookie).

### API

8. **Consolidar endpoints del dashboard**: `/users/:id/dashboard` que devuelva `classesTaken`, `classesRemaining`, `daysRemaining` en una sola llamada.
9. **Versionado**: prefijo `/api/v1/` en todas las rutas.
10. **Endpoint `/health`** para healthcheck del backend.

### Base de datos

11. **Soft deletes** en `classes` (columna `deleted_at`).
12. **Índice** en `classes(user_id, date)` si no existe.
13. **Tabla `plans`** si se quiere flexibilidad más allá de 12/15 clases.

### Testing / DX

14. **Tests unitarios** de la lógica de fechas (clases tomadas, restantes, días).
15. **Tests de integración** con supertest.
16. **GitHub Actions** con `npm test` y `npm run build`.
17. **OpenAPI/Swagger** generado desde el código.

### Producto

18. Vista de admin (listar alumnos, pagos vencidos, etc.).
19. Exportar historial a CSV/PDF.
20. Notificaciones cuando falten N días para el pago.

### Infra

21. Multi-stage build en los Dockerfiles.
22. Quitar `version: "3.9"` del `docker-compose.yml` (deprecado).
23. Headers de seguridad en la config de nginx (CSP, X-Frame-Options).
24. No exponer el puerto 3000 del backend en producción.

### Repo

25. Agregar `LICENSE`.
26. Screenshots en el README.
27. Tags y CHANGELOG.
