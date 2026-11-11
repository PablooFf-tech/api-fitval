# API del Gimnasio FitVal

API REST para la gestión del gimnasio **FitVal**, desarrollada con **NestJS 11**, **TypeScript** y **PostgreSQL 17** con conexión mediante `pg` (node-postgres), autenticación mediante **Argon2** y **JWT**, control de acceso basado en roles (`AuthGuard` y `StaffGuard`) y validación estricta con `class-validator`.

---

## Requisitos previos

- Node.js 24+
- Docker y Docker Compose

---

## Instalación y puesta en marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/PablooFf-tech/api-fitval.git
cd api-fitval
```

### 2. Configurar variables de entorno
Copia la plantilla de entorno:
```bash
cp .env.example .env
```
El archivo `.env` resultante contiene:
```env
DATABASE_URL=postgres://alumno:alumno_dev_123@localhost:5433/fitval
JWT_SECRET=super_secreto_fitval_jwt_2026
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Arrancar PostgreSQL con Docker
```bash
docker compose up -d
```
El servicio escuchará en el puerto local **`5433`** (para no colisionar con otros contenedores PostgreSQL estándar en el 5432).

### 5. Cargar el esquema y datos de prueba
```bash
# macOS / Linux / Git Bash:
docker exec -i postgres-fitval psql -U alumno -d fitval < database/schema.sql

# PowerShell:
Get-Content database/schema.sql | docker exec -i postgres-fitval psql -U alumno -d fitval
```

### 6. Iniciar la API
```bash
# Modo desarrollo con recarga en caliente:
npm run start:dev

# Compilación y producción:
npm run build
npm run start:prod
```

La API quedará escuchando en `http://localhost:3000/api`.

---

## Endpoints de la API

Todas las rutas llevan el prefijo `/api`:

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/health` | Estado de la API y verificación de conexión con PostgreSQL | Público |
| `GET` | `/api/plans` | Listado de planes ordenados por precio mensual ascendente | Público |
| `GET` | `/api/classes` | Listado de clases ordenadas por fecha con nombre del monitor | Público |
| `GET` | `/api/classes?activity=yoga` | Búsqueda insensible a mayúsculas parametrizada (`$1`) | Público |
| `GET` | `/api/classes/:id` | Detalle de una clase por su ID | Público |
| `POST` | `/api/classes` | Creación de una clase con comprobación de existencia de monitor | Personal (`staff`) |
| `DELETE` | `/api/classes/:id` | Borrado de una clase comprobando que no tenga reservas asociadas | Personal (`staff`) |
| `POST` | `/api/auth/register` | Registro de usuario con hash seguro Argon2 | Público |
| `POST` | `/api/auth/login` | Login con credenciales, devuelve JWT con `{ sub: id }` | Público |
| `GET` | `/api/auth/me` | Consulta de perfil del usuario autenticado | Autenticado (`member` / `staff`) |

---

## Respuestas y códigos HTTP

- `200 OK`: Petición procesada correctamente.
- `201 Created`: Recurso creado con éxito (`POST /api/classes`, `POST /api/auth/register`).
- `400 Bad Request`: Formato incorrecto, validación DTO fallida o `trainerId` inexistente.
- `401 Unauthorized`: Token ausente, caducado, alterado o credenciales de login inválidas.
- `403 Forbidden`: Usuario autenticado pero sin rol suficiente (`StaffGuard`).
- `404 Not Found`: Recurso no encontrado por ID de ruta.
- `409 Conflict`: Conflicto de estado (correo duplicado o borrado de clase con reservas activas).
- `500 Internal Server Error`: Error no controlado o caída del servidor de base de datos.

---

## Verificación de calidad y CI

- Linter: `npm run lint`
- Build: `npm run build`
- CI en GitHub Actions: `.github/workflows/ci.yml` ejecutando `htmlhint` y `lint` en Node 24 con la rama `main` protegida.
- Respuestas a los ejercicios teóricos y prácticos documentadas en [respuestas.md](respuestas.md).
