/**
 * features/security/auth — alta y verificacion del PIN maestro.
 *
 * Flujo (Fase 0, funcional):
 * - Primera vez: se genera un salt unico, se deriva la clave del PIN y se
 *   guarda en `AppMeta` un "verificador" (un texto conocido cifrado). El PIN
 *   NUNCA se guarda.
 * - Siguientes: se deriva la clave del PIN introducido y se intenta descifrar
 *   el verificador. Si coincide, el PIN es correcto y la clave queda en memoria.
 *
 * La verificacion completa (cambio de PIN, intentos, bloqueo) llega en Fase 3.
 */
import {
  decryptString,
  deriveKey,
  encryptString,
  generateSalt,
  saltFromBase64,
  saltToBase64,
  setSessionKey,
} from '@/lib/crypto';
import { db, SCHEMA_VERSION } from '@/lib/db';

const VERIFIER_PLAINTEXT = 'patrimonio-verifier-v1';
const MIN_PIN_LENGTH = 4;

/** `true` si ya existe un PIN configurado en este dispositivo. */
export const isPinConfigured = async (): Promise<boolean> => {
  const meta = await db.appMeta.get('app');
  return meta !== undefined;
};

/** Crea el PIN por primera vez y deja la app desbloqueada. */
export const setupPin = async (pin: string): Promise<void> => {
  assertPinLength(pin);
  const salt = generateSalt();
  const key = await deriveKey(pin, salt);
  const verifier = await encryptString(key, VERIFIER_PLAINTEXT);

  await db.appMeta.put({
    id: 'app',
    salt: saltToBase64(salt),
    verifier,
    schemaVersion: SCHEMA_VERSION,
  });

  setSessionKey(key);
};

/** Intenta desbloquear con el PIN. Devuelve `true` si es correcto. */
export const unlockWithPin = async (pin: string): Promise<boolean> => {
  const meta = await db.appMeta.get('app');
  if (!meta) {
    throw new Error('No hay PIN configurado en este dispositivo.');
  }

  const key = await deriveKey(pin, saltFromBase64(meta.salt));
  try {
    const decrypted = await decryptString(key, meta.verifier);
    if (decrypted !== VERIFIER_PLAINTEXT) {
      return false;
    }
  } catch {
    // Descifrado fallido => PIN incorrecto.
    return false;
  }

  setSessionKey(key);
  return true;
};

const assertPinLength = (pin: string): void => {
  if (pin.length < MIN_PIN_LENGTH) {
    throw new Error('PIN demasiado corto.');
  }
};

export { MIN_PIN_LENGTH };
