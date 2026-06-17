/**
 * lib/crypto/encryption — cifrado de campos con Web Crypto API.
 *
 * Modelo: cifrado field-level con AES-GCM. La clave se deriva de un PIN/clave
 * maestra con PBKDF2. Cada valor cifrado lleva su propio IV aleatorio.
 *
 * Reglas de seguridad:
 * - Nunca se persiste un dato sensible en claro.
 * - Nunca se loggea ni el texto plano ni la clave.
 * - La clave de sesion vive solo en memoria (ver session.ts).
 */

const subtle = globalThis.crypto.subtle;

/** Iteraciones de PBKDF2. >= 210.000 segun OWASP para PBKDF2-HMAC-SHA256. */
export const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const AES_KEY_BITS = 256;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/** Valor cifrado listo para persistir: IV + ciphertext, ambos en base64. */
export interface EncryptedValue {
  /** Vector de inicializacion (base64), unico por valor. */
  readonly iv: string;
  /** Texto cifrado (base64). */
  readonly ct: string;
}

const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

/** Genera un salt aleatorio nuevo (unico por instalacion). */
export const generateSalt = (): Uint8Array =>
  globalThis.crypto.getRandomValues(new Uint8Array(SALT_BYTES));

/** Serializa un salt a base64 para guardarlo en `AppMeta`. */
export const saltToBase64 = (salt: Uint8Array): string => toBase64(salt);

/** Recupera un salt desde base64. */
export const saltFromBase64 = (value: string): Uint8Array => fromBase64(value);

/**
 * Deriva una clave AES-GCM de 256 bits a partir de una passphrase y un salt.
 * La clave no es exportable (no se puede extraer del navegador).
 */
export const deriveKey = async (
  passphrase: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<CryptoKey> => {
  const baseKey = await subtle.importKey(
    'raw',
    textEncoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: AES_KEY_BITS },
    false,
    ['encrypt', 'decrypt'],
  );
};

/** Cifra una cadena con la clave de sesion. */
export const encryptString = async (
  key: CryptoKey,
  plaintext: string,
): Promise<EncryptedValue> => {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertext = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    textEncoder.encode(plaintext),
  );
  return { iv: toBase64(iv), ct: toBase64(new Uint8Array(ciphertext)) };
};

/** Descifra un `EncryptedValue`. Lanza si la clave es incorrecta o hay tampering. */
export const decryptString = async (
  key: CryptoKey,
  value: EncryptedValue,
): Promise<string> => {
  const plaintext = await subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(value.iv) },
    key,
    fromBase64(value.ct),
  );
  return textDecoder.decode(plaintext);
};
