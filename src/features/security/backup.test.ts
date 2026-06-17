import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/lib/db';
import { accountRepository } from '@/lib/repositories';

import { setupPin } from './auth';
import { createBackup, restoreBackup } from './backup';

beforeEach(async () => {
  await db.delete();
  await db.open();
  await setupPin('1234');
});

describe('features/security/backup', () => {
  it('crea y restaura un backup cifrado (ida y vuelta)', async () => {
    await accountRepository.add({
      name: 'Ahorro',
      type: 'bank',
      currency: 'EUR',
    });
    const text = await (await createBackup('clave-backup')).text();

    // Borramos y restauramos.
    await accountRepository.delete((await accountRepository.getAll())[0]!.id);
    expect(await accountRepository.getAll()).toHaveLength(0);

    await restoreBackup('clave-backup', text);
    const restored = await accountRepository.getAll();
    expect(restored).toHaveLength(1);
    expect(restored[0]?.name).toBe('Ahorro');
  });

  it('falla al restaurar con contrasena incorrecta', async () => {
    const text = await (await createBackup('clave-correcta')).text();
    await expect(restoreBackup('clave-mala', text)).rejects.toThrow();
  });

  it('rechaza un fichero que no es un backup', async () => {
    await expect(restoreBackup('x', '{"foo":1}')).rejects.toThrow();
  });
});
