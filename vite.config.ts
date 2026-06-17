/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// La app se sirve en GitHub Pages bajo la subruta /Fintech/.
// En desarrollo usamos la raiz para comodidad.
const BASE_PATH = '/Fintech/';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const base = command === 'build' ? BASE_PATH : '/';
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        // Funciona 100% offline: precachea el app shell generado por el build.
        includeAssets: ['favicon.svg', 'icon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'Patrimonio',
          short_name: 'Patrimonio',
          description:
            'PWA local-first, cifrada y sin nube para controlar tu patrimonio neto real.',
          lang: 'es',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          // Instalada, la PWA abre directamente la app; el scope cubre toda la web.
          start_url: `${base}app`,
          scope: base,
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          // App local-first: nunca cacheamos llamadas de red externas porque no hay.
          navigateFallback: `${base}index.html`,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      css: false,
    },
  };
});
