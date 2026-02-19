# NestJS Boilerplate

NestJS API with Prisma (SQL Server), configurable SMTP/FTP integrations, and Microsoft Entra ID login.

## Project folder structure

```
src/
├── main.ts
├── app.module.ts
│
├── config/
│   ├── configuration.ts      # App config (port, env, DB, SMTP, FTP, Entra ID)
│   └── env.validation.ts     # Joi schema for env validation
│
├── common/
│   ├── constants/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── middleware/
│   ├── pipes/
│   └── utils/
│
├── database/
│   ├── database.module.ts
│   ├── prisma.service.ts
│   └── index.ts
│
├── integrations/             # External services (optional, config from .env)
│   ├── smtp/
│   │   ├── smtp.module.ts
│   │   ├── smtp.service.ts
│   │   └── index.ts
│   ├── ftp/
│   │   ├── ftp.module.ts
│   │   ├── ftp.service.ts
│   │   └── index.ts
│   ├── entra-id/              # Microsoft Entra ID (login URL + token exchange)
│   │   ├── entra-id.module.ts
│   │   ├── entra-id.service.ts
│   │   └── index.ts
│   └── index.ts
│
├── modules/
│   ├── auth/                  # Auth (Entra ID login writer)
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── index.ts
│   └── sample/                # Sample feature (module + service + repository)
│       ├── sample.module.ts
│       ├── sample.service.ts
│       ├── sample.controller.ts
│       ├── sample.repository.ts
│       └── index.ts
│
prisma/
├── schema.prisma
├── migrations/
└── (prisma.config.ts at project root)
```

## Setup

### 1. Environment

- Copy `.env.example` to `.env` and set `DATABASE_URL` (required).
- For dev: you can copy `.env.development.example` to `.env`.
- For production: set `NODE_ENV=production` and use `.env.production.example` as a reference; set secrets in the host/container.

Config loads, in order: `.env` then `.env.${NODE_ENV}` (e.g. `.env.development`, `.env.production`).

### 2. Database

```bash
npx prisma generate
npx prisma migrate dev   # or deploy in production
```

### 3. Run

```bash
npm run start:dev
```

API base: `http://localhost:3000/api` (or the port from `PORT`).

## API overview

| Area | Description |
|------|-------------|
| **Sample** | `GET/POST /api/sample`, `GET/PATCH/DELETE /api/sample/:id` – sample CRUD. |
| **Auth (Entra ID)** | `GET /api/auth/entra/login` – get login URL; `GET /api/auth/entra/callback?code=...&state=...` – redeem code and return tokens. |

SMTP and FTP are available as global services when configured in `.env`; use `SmtpService` and `FtpService` in your modules.

## Scripts

- `npm run start:dev` – development with watch
- `npm run build` – production build
- `npm run start:prod` – run production build
- `npm run test` – unit tests
- `npm run lint` – lint

## Docker

Build and run with the default Dockerfile:

```bash
docker build -t nestjs-boilerplate .
docker run -p 3000:3000 --env-file .env nestjs-boilerplate
```

Use a real `.env` or pass env vars; ensure `DATABASE_URL` and any optional integration vars are set.
