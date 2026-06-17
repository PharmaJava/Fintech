# Patrimonio

PWA **local-first**, cifrada y **sin nube** cuyo corazón es el **patrimonio neto
real** (no es una app de gastos más). Combina control total del patrimonio
(líquido, invertido, inmuebles, vehículos, otros activos y pasivos, con
histórico de valoraciones), Excel como columna vertebral (exportación
profesional) y, en fases posteriores, motor FIRE y FinScore.

> **Privacidad total**: los datos nunca salen del dispositivo. Cero llamadas a
> servidores propios, cero telemetría, cero analytics.

Es una **aplicación web** (PWA instalable) y está preparada para empaquetarse
como app de **escritorio** más adelante (p. ej. con Tauri) reutilizando el mismo
build, usando solo APIs web estándar.

## Stack

React 19 · Vite · TypeScript (strict) · TailwindCSS · shadcn/ui · Dexie
(IndexedDB) · Web Crypto (AES-GCM + PBKDF2) · Zustand · Zod · date-fns ·
Recharts · ExcelJS · Vitest · vite-plugin-pwa.

## Requisitos

- Node.js 22+
- pnpm 10+

## Cómo arrancar

```bash
pnpm install     # instala dependencias
pnpm dev         # arranca el servidor de desarrollo
```

## Scripts

| Script              | Descripción                                           |
| ------------------- | ----------------------------------------------------- |
| `pnpm dev`          | Servidor de desarrollo (Vite).                        |
| `pnpm build`        | Type-check (`tsc -b`) + build de producción.          |
| `pnpm preview`      | Sirve el build de producción (verificar PWA/offline). |
| `pnpm test`         | Tests con Vitest (una pasada).                        |
| `pnpm test:watch`   | Tests en modo watch.                                  |
| `pnpm lint`         | ESLint sobre todo el proyecto.                        |
| `pnpm format`       | Formatea con Prettier.                                |
| `pnpm format:check` | Comprueba el formato sin escribir.                    |

## Documentación

- [`CLAUDE.md`](./CLAUDE.md): memoria del proyecto (arquitectura, principios,
  modelo de datos, convenciones, roadmap). **Léelo antes de contribuir.**
- `.claude/skills/`: guías para tareas recurrentes (cifrado, migraciones,
  features, dinero/cálculo, export Excel).

## Estado

**Fase 0** — scaffold y cimientos. Sin features de negocio todavía.
