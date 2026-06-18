import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import App from './App.tsx';
import './styles/globals.css';
// Captura temprana del evento de instalación PWA (beforeinstallprompt).
import '@/lib/pwa/install';

// Service worker: actualizacion automatica para que la app funcione offline.
registerSW({ immediate: true });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No se encontro el elemento #root en el DOM.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
