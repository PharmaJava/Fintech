/**
 * lib/repositories/fields — helpers para cifrar/descifrar tipos de campo.
 *
 * Centraliza la (de)serializacion de los tipos no-string antes de cifrarlos,
 * para que los repositorios queden declarativos y consistentes.
 */
import {
  decryptString,
  encryptString,
  type EncryptedValue,
} from '@/lib/crypto';
import { cents, type Cents } from '@/lib/money';

/** Cifra un importe `Cents` (se serializa como su entero). */
export const encryptCents = (
  key: CryptoKey,
  value: Cents,
): Promise<EncryptedValue> => encryptString(key, String(value));

/** Descifra un `EncryptedValue` de vuelta a `Cents`. */
export const decryptCents = async (
  key: CryptoKey,
  value: EncryptedValue,
): Promise<Cents> => cents(Number(await decryptString(key, value)));

/** Cifra un objeto serializandolo a JSON (p.ej. templateTxn de una recurrente). */
export const encryptJson = (
  key: CryptoKey,
  value: unknown,
): Promise<EncryptedValue> => encryptString(key, JSON.stringify(value));

/** Descifra un JSON cifrado a un tipo `T` (validar con Zod en la capa superior). */
export const decryptJson = async <T>(
  key: CryptoKey,
  value: EncryptedValue,
): Promise<T> => JSON.parse(await decryptString(key, value)) as T;
