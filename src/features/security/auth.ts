/**
 * features/security/auth — alta, verificacion y cambio del PIN maestro,
 * con control de intentos fallidos (Fase 3).
 *
 * Flujo:
 * - Primera vez: salt unico + clave derivada del PIN + verificador cifrado.
 * - Desbloqueo: deriva la clave y descifra el verificador.
 * - Cambio de PIN: re-cifra TODOS los datos con la clave nueva (la clave deriva
 *   directamente del PIN, asi que cambiar el PIN implica re-cifrar).
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
import { getDb, SCHEMA_VERSION } from '@/lib/db';
import {
  accountRepository,
  assetRepository,
  autoRuleRepository,
  budgetRepository,
  categoryRepository,
  financialEventRepository,
  goalRepository,
  liabilityRepository,
  recurringRuleRepository,
  transactionRepository,
  valuationRepository,
} from '@/lib/repositories';

const VERIFIER_PLAINTEXT = 'patrimonio-verifier-v1';
const MIN_PIN_LENGTH = 4;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 30_000;

// Control de intentos fallidos (en memoria, por sesion de la pestania).
let failedAttempts = 0;
let lockedUntil = 0;

/** Milisegundos restantes de bloqueo por intentos fallidos (0 si no bloqueado). */
export const getLockRemainingMs = (): number =>
  Math.max(0, lockedUntil - Date.now());

/** `true` si ya existe un PIN configurado en este dispositivo. */
export const isPinConfigured = async (): Promise<boolean> => {
  const meta = await getDb().appMeta.get('app');
  return meta !== undefined;
};

/** Crea el PIN por primera vez y deja la app desbloqueada. */
export const setupPin = async (pin: string): Promise<void> => {
  assertPinLength(pin);
  const salt = generateSalt();
  const key = await deriveKey(pin, salt);
  const verifier = await encryptString(key, VERIFIER_PLAINTEXT);

  await getDb().appMeta.put({
    id: 'app',
    salt: saltToBase64(salt),
    verifier,
    schemaVersion: SCHEMA_VERSION,
  });

  resetAttempts();
  setSessionKey(key);
};

/** Deriva y verifica la clave de un PIN contra el verificador almacenado. */
const deriveVerifiedKey = async (pin: string): Promise<CryptoKey | null> => {
  const meta = await getDb().appMeta.get('app');
  if (!meta) {
    throw new Error('No hay PIN configurado en este dispositivo.');
  }
  const key = await deriveKey(pin, saltFromBase64(meta.salt));
  try {
    if ((await decryptString(key, meta.verifier)) !== VERIFIER_PLAINTEXT) {
      return null;
    }
  } catch {
    return null;
  }
  return key;
};

/** Intenta desbloquear con el PIN. Devuelve `true` si es correcto. */
export const unlockWithPin = async (pin: string): Promise<boolean> => {
  if (getLockRemainingMs() > 0) {
    return false;
  }
  const key = await deriveVerifiedKey(pin);
  if (key === null) {
    registerFailure();
    return false;
  }
  resetAttempts();
  setSessionKey(key);
  return true;
};

/**
 * Cambia el PIN re-cifrando todos los datos con la clave nueva.
 * Devuelve `false` si el PIN actual no es correcto.
 */
export const changePin = async (
  currentPin: string,
  newPin: string,
): Promise<boolean> => {
  assertPinLength(newPin);
  const currentKey = await deriveVerifiedKey(currentPin);
  if (currentKey === null) {
    return false;
  }

  // Leer todo el dato descifrado con la clave actual.
  setSessionKey(currentKey);
  const [
    accounts,
    assets,
    liabilities,
    valuations,
    transactions,
    categories,
    budgets,
    recurringRules,
    goals,
    autoRules,
    events,
  ] = await Promise.all([
    accountRepository.getAll(),
    assetRepository.getAll(),
    liabilityRepository.getAll(),
    valuationRepository.getAll(),
    transactionRepository.getAll(),
    categoryRepository.getAll(),
    budgetRepository.getAll(),
    recurringRuleRepository.getAll(),
    goalRepository.getAll(),
    autoRuleRepository.getAll(),
    financialEventRepository.getAll(),
  ]);

  // Derivar clave nueva y activarla.
  const meta = await getDb().appMeta.get('app');
  const newSalt = generateSalt();
  const newKey = await deriveKey(newPin, newSalt);
  const verifier = await encryptString(newKey, VERIFIER_PLAINTEXT);
  setSessionKey(newKey);

  // Re-cifrar todo con la clave nueva.
  await Promise.all([
    ...accounts.map((x) => accountRepository.put(x)),
    ...assets.map((x) => assetRepository.put(x)),
    ...liabilities.map((x) => liabilityRepository.put(x)),
    ...valuations.map((x) => valuationRepository.put(x)),
    ...transactions.map((x) => transactionRepository.put(x)),
    ...categories.map((x) => categoryRepository.put(x)),
    ...budgets.map((x) => budgetRepository.put(x)),
    ...recurringRules.map((x) => recurringRuleRepository.put(x)),
    ...goals.map((x) => goalRepository.put(x)),
    ...autoRules.map((x) => autoRuleRepository.put(x)),
    ...events.map((x) => financialEventRepository.put(x)),
  ]);

  await getDb().appMeta.put({
    id: 'app',
    salt: saltToBase64(newSalt),
    verifier,
    schemaVersion: meta?.schemaVersion ?? SCHEMA_VERSION,
  });

  return true;
};

const registerFailure = (): void => {
  failedAttempts += 1;
  if (failedAttempts >= MAX_ATTEMPTS) {
    lockedUntil = Date.now() + LOCK_MS;
    failedAttempts = 0;
  }
};

const resetAttempts = (): void => {
  failedAttempts = 0;
  lockedUntil = 0;
};

const assertPinLength = (pin: string): void => {
  if (pin.length < MIN_PIN_LENGTH) {
    throw new Error('PIN demasiado corto.');
  }
};

export { MIN_PIN_LENGTH, MAX_ATTEMPTS };
