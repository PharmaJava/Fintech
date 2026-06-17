/**
 * lib/crypto/session — clave de sesion en memoria.
 *
 * La clave derivada vive UNICAMENTE aqui, en una variable de modulo (memoria).
 * Nunca se persiste (ni disco, ni localStorage, ni IndexedDB). Se borra al
 * bloquear o por inactividad. La capa de repositorios la obtiene via
 * `requireSessionKey()`.
 */

type Listener = () => void;

let sessionKey: CryptoKey | null = null;
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let inactivityMs = 5 * 60 * 1000;

const listeners = new Set<Listener>();

const notify = (): void => {
  for (const listener of listeners) {
    listener();
  }
};

const clearTimer = (): void => {
  if (inactivityTimer !== null) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
};

/** Guarda la clave de sesion en memoria y marca la app como desbloqueada. */
export const setSessionKey = (key: CryptoKey): void => {
  sessionKey = key;
  resetInactivityTimer();
  notify();
};

/** Borra la clave de sesion (bloqueo). */
export const lock = (): void => {
  sessionKey = null;
  clearTimer();
  notify();
};

/** `true` si la app esta desbloqueada (hay clave en memoria). */
export const isUnlocked = (): boolean => sessionKey !== null;

/** Devuelve la clave de sesion o lanza si la app esta bloqueada. */
export const requireSessionKey = (): CryptoKey => {
  if (sessionKey === null) {
    throw new Error('La aplicacion esta bloqueada: no hay clave de sesion.');
  }
  return sessionKey;
};

/** Configura el tiempo de inactividad (ms) tras el cual se bloquea sola. */
export const setInactivityTimeout = (ms: number): void => {
  inactivityMs = ms;
  if (isUnlocked()) {
    resetInactivityTimer();
  }
};

/** Reinicia el temporizador de inactividad (llamar ante actividad del usuario). */
export const resetInactivityTimer = (): void => {
  if (!isUnlocked()) {
    return;
  }
  clearTimer();
  inactivityTimer = setTimeout(lock, inactivityMs);
};

/** Suscribe a cambios de estado (bloqueo/desbloqueo). Devuelve la baja. */
export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
