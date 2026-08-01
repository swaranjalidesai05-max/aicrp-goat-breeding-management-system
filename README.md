# AICRP Sangamneri Goat Breeding & Genetic Tracking System

Monorepo for digitizing goat breeding and genetic tracking under the All India Coordinated Research Project (AICRP).

## Repository structure

```
├── admin-panel/     # React + Vite + TypeScript + Tailwind (web dashboard)
├── backend/         # Node.js + Express + TypeScript + Prisma API
├── mobile-app/      # Flutter mobile app (placeholder — Phase 0)
├── docs/            # Product & architecture documentation
├── docker-compose.yml
└── package.json     # npm workspaces root
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (for PostgreSQL)
- Flutter SDK (for `mobile-app`, later phases)

## Quick start (local development)

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment files**

   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp admin-panel/.env.example admin-panel/.env
   ```

3. **Start PostgreSQL**

   ```bash
   npm run docker:up
   ```

4. **Generate Prisma client**

   ```bash
   npm run db:generate
   ```

5. **Run apps**

   ```bash
   npm run dev:backend   # http://localhost:4000
   npm run dev:admin     # http://localhost:5173
   ```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev:backend` | Start API in watch mode |
| `npm run dev:admin` | Start admin panel Vite dev server |
| `npm run lint` | Lint backend and admin-panel |
| `npm run format` | Format with Prettier |
| `npm run docker:up` | Start Postgres via Docker Compose |
| `npm run docker:down` | Stop Docker Compose services |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |

## Phase status

**Phase 0** — Monorepo scaffolding, tooling, Docker Postgres, Prisma wiring. No authentication or business modules yet.

## Documentation

- [Project overview](docs/project-overview.md)
- [Architecture](docs/architecture.md)
- [Backend README](backend/README.md)
- [Admin panel README](admin-panel/README.md)
- [Mobile app README](mobile-app/README.md)
