/**
 * lib/pwa/install — soporte de instalación de la PWA (Android/escritorio e iOS).
 *
 * Captura `beforeinstallprompt` (Chrome/Android/escritorio) para ofrecer un
 * botón de instalación nativo. En iOS/Safari no existe ese evento: se detecta
 * el navegador para mostrar instrucciones de "Añadir a pantalla de inicio".
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

const notify = (): void => {
  for (const listener of listeners) listener();
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

/** `true` si hay un prompt de instalación nativo disponible. */
export const canInstall = (): boolean => deferredPrompt !== null;

/** Lanza el prompt nativo de instalación (Android/escritorio). */
export const promptInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notify();
  return choice.outcome === 'accepted';
};

/** Suscribe a cambios de disponibilidad del prompt. */
export const subscribeInstall = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** `true` en iPhone/iPad (Safari no soporta beforeinstallprompt). */
export const isIOS = (): boolean =>
  typeof navigator !== 'undefined' &&
  /iphone|ipad|ipod/i.test(navigator.userAgent);

/** `true` si la app ya está instalada (modo standalone). */
export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  const standaloneMedia =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone =
    'standalone' in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standaloneMedia || iosStandalone;
};
