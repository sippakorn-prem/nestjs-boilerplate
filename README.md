# NestJS Boilerplate

NestJS API with Prisma (SQL Server), configurable SMTP/FTP integrations, and Microsoft Entra ID login.

## Project structure

```
src/
├── main.ts
├── app.module.ts
├── config/
├── common/
├── database/
├── integrations/
├── modules/
prisma/
```

### What each folder is for

| Folder | Purpose |
|--------|---------|
| **`src/config/`** | App-wide configuration and env validation. |
| **`src/common/`** | Shared utilities, decorators, filters, guards, interceptors, middleware, pipes. |
| **`src/database/`** | Database connection and ORM (e.g. Prisma). |
| **`src/integrations/`** | **External** modules: third-party or external services (SMTP, FTP, Entra ID, etc.). Config from `.env`, optional at runtime. |
| **`src/modules/`** | **Internal** modules: your app’s features (auth, health, sample, etc.). Use integrations and database as needed. |
| **`prisma/`** | Schema, migrations, and Prisma config. |

---

## If I want to create a module, what should I have?

### 1. Decide where it lives

- **External service (API, SMTP, OAuth, etc.)** → `src/integrations/<name>/`
- **App feature (auth, users, orders, etc.)** → `src/modules/<name>/`

### 2. Files to add (by convention)

Create a folder `src/integrations/<name>/` or `src/modules/<name>/` and add:

| File | When to use |
|------|-------------|
| **`<name>.module.ts`** | Always. Declares the NestJS module and exports. |
| **`<name>.service.ts`** | Always. Business or integration logic. |
| **`<name>.controller.ts`** | When the module exposes HTTP routes (internal modules). |
| **`<name>.repository.ts`** | When the module needs data access (internal modules). |
| **`<name>.interface.ts`** | When the module has types or interfaces. |
| **`<name>.enum.ts`** | When the module has enums. |
| **`<name>.constant.ts`** | When the module has constants. |
| **`<name>.config.ts`** | When the module reads its own config from env (often in integrations). |
| **`index.ts`** | Re-export the module and public types/services. |

### 3. Register the module

Import the new module in `src/app.module.ts` and add it to the `imports` array.

### 4. Optional: env and config

- For **integrations**: add env vars to `.env.example` and, if the module owns its config, a `<name>.config.ts` that reads them (and optionally register in `src/config/configuration.ts`).
- For **internal modules**: use existing config or inject `ConfigService` as needed.

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
