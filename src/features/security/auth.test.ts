import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import { isUnlocked, lock } from '@/lib/crypto';
import { db } from '@/lib/db';
import { accountRepository } from '@/lib/repositories';

import { changePin, setupPin, unlockWithPin } from './auth';

beforeEach(async () => {
  lock();
  await db.delete();
  await db.open();
});

describe('features/security/auth', () => {
  it('configura el PIN y desbloquea', async () => {
    await setupPin('1234');
    expect(isUnlocked()).toBe(true);
    lock();
    expect(await unlockWithPin('1234')).toBe(true);
    expect(await unlockWithPin('0000')).toBe(false);
  });

  it('cambia el PIN re-cifrando los datos (legibles con el nuevo, no con el viejo)', async () => {
    await setupPin('1111');
    await accountRepository.add({
      name: 'Cuenta',
      type: 'bank',
      currency: 'EUR',
    });

    expect(await changePin('1111', '2222')).toBe(true);

    lock();
    expect(await unlockWithPin('1111')).toBe(false);
    expect(await unlockWithPin('2222')).toBe(true);

    const accounts = await accountRepository.getAll();
    expect(accounts).toHaveLength(1);
    expect(accounts[0]?.name).toBe('Cuenta');
  });

  it('changePin falla si el PIN actual es incorrecto', async () => {
    await setupPin('1111');
    expect(await changePin('9999', '2222')).toBe(false);
  });
});
