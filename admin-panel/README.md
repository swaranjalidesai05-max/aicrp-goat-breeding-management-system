# Admin Panel

React + Vite + TypeScript + Tailwind CSS web dashboard for Director / HoD / Scientist / Co-PI users.

## Stack

- React 19
- Vite 6
- TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- ESLint + Prettier (workspace)

## Setup

```bash
# From repo root
cp admin-panel/.env.example admin-panel/.env
npm install
npm run dev -w admin-panel
```

Dev server: `http://localhost:5173`

Vite proxies `/api` → `http://localhost:4000`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Folder structure

```
admin-panel/
├── src/
│   ├── App.tsx           # Root UI shell (Phase 0 placeholder)
│   ├── main.tsx          # React entry
│   ├── index.css         # Tailwind entry
│   └── vite-env.d.ts     # Vite env typings
├── index.html
├── vite.config.ts
├── eslint.config.js
├── .env.example
└── package.json
```

## Phase 0 notes

- No auth, routing modules, or business screens yet.
- Placeholder page confirms the toolchain is wired.
