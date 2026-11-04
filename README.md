# Cartelera, catálogo de películas

Aplicación web full-stack con Node.js, Express y PostgreSQL (Supabase).

## Funcionalidades

- Registro y login con JWT guardado en una cookie httpOnly
- CRUD de películas con roles (user/admin)
- Búsqueda por título o director, filtro por género, orden y paginación (`?page=2&limit=10`)
- Vistas dinámicas con EJS, layout base, partials y mensajes flash
- Manejo global de errores
- Tests con Jest y supertest
- Docker y docker-compose con base de datos
- Desplegada en producción con HTTPS

## Roles

- `user`: crea, ve, edita y elimina solo sus propias películas
- `admin`: ve, edita y elimina las películas de todos los usuarios

## Tecnologías

- Node.js 24 LTS
- Express 5
- node-postgres (`pg`) sobre PostgreSQL en Supabase
- JWT (`jsonwebtoken`) + bcrypt
- EJS + express-ejs-layouts
- Bootstrap 5
- Helmet, express-validator, express-rate-limit

## Estructura

```text
config/        conexión a la base de datos, variables y esquema SQL
controllers/   reciben la petición y responden
middlewares/   autenticación, validaciones, flash, límites y errores
models/        acceso a datos y reglas de negocio
routes/        definición de rutas
views/         layouts, partials y vistas EJS
public/        css, js e imágenes
```

## Enlace en producción

https://tu-app.example.com

## Instalación local

1. `npm install`
2. Copiar `.env.example` a `.env` y completar las variables
3. `npm start`

La aplicación crea las tablas al iniciar. Con `npm run seed` se cargan películas de ejemplo.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión de Supabase |
| `JWT_SECRET` | Clave para firmar los tokens (mínimo 32 caracteres en producción) |
| `NODE_ENV` | `development` o `production` |
| `ADMIN_EMAIL` y `ADMIN_PASSWORD` | Crean o promueven al usuario administrador al iniciar |
| `DB_SSL` | `false` solo para bases locales sin SSL |

## Docker

`docker compose up --build` levanta la app en `http://localhost:3000` junto con PostgreSQL.

## Tests

`npm test`
