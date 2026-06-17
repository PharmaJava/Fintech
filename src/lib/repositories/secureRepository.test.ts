import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import { deriveKey, generateSalt, lock, setSessionKey } from '@/lib/crypto';
import { db } from '@/lib/db';
import { cents } from '@/lib/money';

import { accountRepository } from './accountRepository';
import { liabilityRepository } from './liabilityRepository';

beforeEach(async () => {
  await db.delete();
  await db.open();
  const key = await deriveKey('pin-de-prueba', generateSalt(), 10_000);
  setSessionKey(key);
});

describe('SecureRepository', () => {
  it('guarda cifrado y devuelve descifrado (round-trip)', async () => {
    const created = await accountRepository.add({
      name: 'Cuenta nomina',
      type: 'bank',
      currency: 'EUR',
    });

    const fetched = await accountRepository.getById(created.id);
    expect(fetched).toEqual(created);
    expect(fetched?.name).toBe('Cuenta nomina');
  });

  it('persiste el nombre CIFRADO (no en claro) en IndexedDB', async () => {
    const created = await accountRepository.add({
      name: 'Texto super secreto',
      type: 'cash',
      currency: 'EUR',
    });

    const raw = await db.accounts.get(created.id);
    // El campo sensible debe ser un EncryptedValue, no la cadena en claro.
    expect(raw?.name).toMatchObject({
      iv: expect.any(String),
      ct: expect.any(String),
    });
    expect(JSON.stringify(raw)).not.toContain('Texto super secreto');
    // Los campos indexables no sensibles si estan en claro.
    expect(raw?.currency).toBe('EUR');
  });

  it('cifra importes Cents y los recupera intactos', async () => {
    const created = await liabilityRepository.add({
      name: 'Hipoteca',
      principal: cents(15_000_000),
      interestRate: 0.029,
    });

    const fetched = await liabilityRepository.getById(created.id);
    expect(fetched?.principal).toBe(15_000_000);
    expect(fetched?.interestRate).toBe(0.029);
  });

  it('lanza si la app esta bloqueada (sin clave de sesion)', async () => {
    lock();
    await expect(
      accountRepository.add({ name: 'x', type: 'bank', currency: 'EUR' }),
    ).rejects.toThrow(/bloqueada/i);
  });
});
