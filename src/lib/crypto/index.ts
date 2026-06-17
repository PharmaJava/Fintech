export type { EncryptedValue } from './encryption';
export {
  PBKDF2_ITERATIONS,
  deriveKey,
  encryptString,
  decryptString,
  generateSalt,
  saltToBase64,
  saltFromBase64,
} from './encryption';
export {
  setSessionKey,
  lock,
  isUnlocked,
  requireSessionKey,
  setInactivityTimeout,
  resetInactivityTimer,
  subscribe,
} from './session';
