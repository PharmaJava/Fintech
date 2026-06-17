---
name: pwa-offline
description: >
  Checklist de PWA en Patrimonio: service worker, manifest e instalación, y cómo
  verificar que funciona sin conexión. Actívala al tocar vite-plugin-pwa, el
  manifest, los iconos o el registro del service worker.
---

# pwa-offline

## Cuándo activarla

Al tocar la configuración PWA, el manifest, los iconos o el service worker, o
para verificar el funcionamiento offline.

## Dónde está la config

- `vite.config.ts` → plugin `VitePWA` (manifest + workbox + iconos).
- `src/main.tsx` → `registerSW({ immediate: true })` (auto-update).
- Iconos en `public/` (generados por `scripts/generate-icons.mjs`).

## Puntos clave

- `registerType: 'autoUpdate'` → el SW se actualiza solo.
- `base` de Vite y `scope`/`start_url` del manifest van bajo **`/Fintech/`** en
  build (GitHub Pages). En dev, base `/`.
- App **local-first**: no se cachean llamadas de red externas porque NO hay.
  `navigateFallback` apunta al `index.html` con base correcta.
- `workbox.globPatterns` precachea el app shell para offline real.

## Verificar offline (manual, en local)

```bash
pnpm build && pnpm preview
```

1. Abre la URL del preview (bajo `/Fintech/`).
2. DevTools → Application → Service Workers: el SW está `activated`.
3. DevTools → Network → marca **Offline** y recarga: la app sigue cargando.
4. Application → Manifest: sin errores; iconos 192/512 presentes.
5. Botón de instalar (omnibox) disponible.

> El despliegue a GitHub Pages se verifica abriendo
> https://pharmajava.github.io/Fintech/ en el navegador (no desde CI).

## Checklist al cambiar la PWA

- [ ] `pnpm build` genera `dist/sw.js` y `dist/manifest.webmanifest`.
- [ ] El manifest tiene iconos 192 y 512 (+ maskable) con rutas bajo la base.
- [ ] `scope`/`start_url` coinciden con la base (`/Fintech/` en prod).
- [ ] Probado offline con `pnpm preview`.

## Errores comunes

- Rutas de assets/manifest absolutas a `/` en vez de a la base `/Fintech/` →
  404 en GitHub Pages. Usa rutas relativas en los iconos del manifest.
- Olvidar el fallback SPA (`404.html`) → rutas profundas dan 404 en Pages (lo
  resuelve el paso "Add SPA 404 fallback" del workflow).
