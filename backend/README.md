# Backend API

Node.js + Express + TypeScript REST API for the AICRP Sangamneri Goat Breeding system.

## Stack

- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- ESLint + Prettier (workspace)

## Setup

```bash
# From repo root
cp backend/.env.example backend/.env
npm install
npm run docker:up
npm run db:generate -w backend
npm run dev -w backend
```

API base: `http://localhost:4000`  
Health: `http://localhost:4000/api/v1/health`

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled `dist/index.js` |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create/apply migrations |
| `npm run prisma:studio` | Prisma Studio UI |

## Folder structure

```
backend/
├── prisma/
│   └── schema.prisma      # DB schema (no domain models in Phase 0)
├── src/
│   ├── config/            # Environment loading
│   ├── lib/               # Shared utilities (Prisma client)
│   ├── routes/            # HTTP routes (health only for now)
│   ├── app.ts             # Express app factory
│   └── index.ts           # Process entrypoint
├── .env.example
├── eslint.config.mjs
├── package.json
└── tsconfig.json
```

## Phase 0 notes

- No authentication, RBAC, or business modules.
- Prisma schema has datasource + generator only; models come in later phases.
- Health route checks Postgres connectivity via `SELECT 1`.
