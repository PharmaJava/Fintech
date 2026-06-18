import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import { deriveKey, generateSalt, setSessionKey } from '@/lib/crypto';
import { db } from '@/lib/db';

import { financialEventRepository } from './financialEventRepository';

beforeEach(async () => {
  await db.delete();
  await db.open();
  const key = await deriveKey('pin-de-prueba', generateSalt(), 10_000);
  setSessionKey(key);
});

describe('financialEventRepository', () => {
  it('round-trip: guarda cifrado y devuelve descifrado', async () => {
    const created = await financialEventRepository.add({
      title: 'Compré coche',
      date: '2025-04-10',
      kind: 'purchase',
      note: 'Pagado al contado',
    });

    const fetched = await financialEventRepository.getById(created.id);
    expect(fetched).toEqual(created);
    expect(fetched?.title).toBe('Compré coche');
    expect(fetched?.note).toBe('Pagado al contado');
  });

  it('persiste title/note CIFRADOS y deja date/kind en claro', async () => {
    const created = await financialEventRepository.add({
      title: 'Nació mi hija',
      date: '2024-09-01',
      kind: 'family',
    });

    const raw = await db.financialEvents.get(created.id);
    expect(raw?.title).toMatchObject({
      iv: expect.any(String),
      ct: expect.any(String),
    });
    expect(JSON.stringify(raw)).not.toContain('Nació mi hija');
    // Indexables en claro:
    expect(raw?.date).toBe('2024-09-01');
    expect(raw?.kind).toBe('family');
    // Sin nota: el campo cifrado no se persiste.
    expect(raw?.note).toBeUndefined();
  });
});
