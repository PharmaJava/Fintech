import { describe, expect, it } from 'vitest';

import {
  decryptString,
  deriveKey,
  encryptString,
  generateSalt,
  saltFromBase64,
  saltToBase64,
} from './encryption';

describe('lib/crypto/encryption', () => {
  it('cifra y descifra un texto (ida y vuelta)', async () => {
    const salt = generateSalt();
    const key = await deriveKey('pin-secreto-1234', salt, 10_000);

    const encrypted = await encryptString(key, 'Cuenta nomina BBVA');
    expect(encrypted.iv).toBeTypeOf('string');
    expect(encrypted.ct).toBeTypeOf('string');
    expect(encrypted.ct).not.toContain('BBVA');

    const decrypted = await decryptString(key, encrypted);
    expect(decrypted).toBe('Cuenta nomina BBVA');
  });

  it('usa un IV distinto en cada cifrado', async () => {
    const key = await deriveKey('pin', generateSalt(), 10_000);
    const a = await encryptString(key, 'mismo texto');
    const b = await encryptString(key, 'mismo texto');
    expect(a.iv).not.toBe(b.iv);
    expect(a.ct).not.toBe(b.ct);
  });

  it('falla al descifrar con una clave incorrecta', async () => {
    const salt = generateSalt();
    const good = await deriveKey('pin-correcto', salt, 10_000);
    const bad = await deriveKey('pin-incorrecto', salt, 10_000);

    const encrypted = await encryptString(good, 'dato sensible');
    await expect(decryptString(bad, encrypted)).rejects.toThrow();
  });

  it('serializa y recupera el salt en base64', () => {
    const salt = generateSalt();
    const restored = saltFromBase64(saltToBase64(salt));
    expect(Array.from(restored)).toEqual(Array.from(salt));
  });
});
