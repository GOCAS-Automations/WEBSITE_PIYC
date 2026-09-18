# website_PIYC

Sitio web institucional, panel administrativo y módulo de jornadas de **PIYC Programación Industrial y Control S.A.S.** (`piycsas.com`).

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4, con Supabase (Postgres, Auth y Storage) como backend.

La fuente de verdad del proyecto es [`AGENTS.md`](./AGENTS.md). Este README es solo la puerta de entrada.

## Comandos

```bash
npm run dev     # servidor de desarrollo
npm run build   # build de producción — debe pasar limpio antes de cada commit
npm run lint    # ESLint
```

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar los valores (nunca se commitea):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — solo servidor, nunca en el cliente.
- `NEXT_PUBLIC_SITE_URL`

En Vercel van las mismas cuatro. `SUPABASE_ACCESS_TOKEN` (CLI / Management API de Supabase) es personal y solo local — nunca en Vercel ni en el repo.

## Más información

Ver [`AGENTS.md`](./AGENTS.md): stack, estructura del sitio y del panel, datos de contacto oficiales, backend/Supabase y las reglas del proyecto.
