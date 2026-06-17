import 'fake-indexeddb/auto';

import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { deriveKey, generateSalt, lock, setSessionKey } from '@/lib/crypto';
import { deleteProfileDb, setActiveProfile } from '@/lib/db';
import { accountRepository } from '@/lib/repositories';

describe('multi-perfil', () => {
  beforeEach(async () => {
    lock();
    await setActiveProfile('default');
  });

  afterAll(async () => {
    await deleteProfileDb('p2');
  });

  it('aisla datos entre perfiles con bases de datos independientes', async () => {
    const keyDefault = await deriveKey('pin-default', generateSalt(), 1000);
    const keyP2 = await deriveKey('pin-p2', generateSalt(), 1000);

    // Perfil por defecto: añade una cuenta.
    setSessionKey(keyDefault);
    await accountRepository.add({
      name: 'CuentaDefault',
      type: 'bank',
      currency: 'EUR',
    });
    expect(await accountRepository.getAll()).toHaveLength(1);

    // Cambiar al perfil p2: empieza vacío (aislado).
    await setActiveProfile('p2');
    setSessionKey(keyP2);
    expect(await accountRepository.getAll()).toHaveLength(0);
    await accountRepository.add({
      name: 'CuentaP2',
      type: 'cash',
      currency: 'EUR',
    });
    expect((await accountRepository.getAll())[0]?.name).toBe('CuentaP2');

    // Volver al perfil por defecto: sus datos siguen intactos y separados.
    await setActiveProfile('default');
    setSessionKey(keyDefault);
    const back = await accountRepository.getAll();
    expect(back).toHaveLength(1);
    expect(back[0]?.name).toBe('CuentaDefault');
  });
});
