/**
 * features/security/jsonBackup — exportación/importación de TODOS los datos en
 * JSON plano (sin cifrar), para portabilidad e inspección.
 *
 * A diferencia del backup cifrado (`backup.ts`), este JSON va EN CLARO: es para
 * migrar o revisar tus datos, no para almacenarlos de forma segura. La
 * importación REEMPLAZA todos los datos actuales (re-cifrándolos con tu PIN).
 *
 * Reutiliza `snapshotAll`/`restoreAll`: nunca toca Dexie ni el cifrado a mano.
 */
import { z } from 'zod';

import {
  restoreAll,
  snapshotAll,
  type DataSnapshot,
} from '@/lib/repositories/maintenance';

export const JSON_FORMAT = 'patrimonio-json';
const JSON_VERSION = 1;

/** Colección de entidades: array de objetos con `id` string (contenido laxo). */
const collection = z.array(z.object({ id: z.string() }).passthrough());

/** Envoltorio del export. Los importes se validan al re-cifrar en cada repo. */
const envelopeSchema = z.object({
  format: z.literal(JSON_FORMAT),
  version: z.number(),
  exportedAt: z.string().optional(),
  data: z.object({
    accounts: collection.default([]),
    assets: collection.default([]),
    liabilities: collection.default([]),
    valuations: collection.default([]),
    transactions: collection.default([]),
    categories: collection.default([]),
    budgets: collection.default([]),
    recurringRules: collection.default([]),
    goals: collection.default([]),
    autoRules: collection.default([]),
    events: collection.optional(),
  }),
});

/** Serializa todos los datos (descifrados) a un JSON legible. */
export const exportJson = async (): Promise<string> => {
  const data = await snapshotAll();
  return JSON.stringify(
    {
      format: JSON_FORMAT,
      version: JSON_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    },
    null,
    2,
  );
};

/**
 * Importa un JSON exportado y REEMPLAZA todos los datos. Lanza si el formato no
 * es válido. Devuelve el número total de registros restaurados.
 */
export const importJson = async (text: string): Promise<number> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('json.invalid');
  }
  const result = envelopeSchema.safeParse(parsed);
  if (!result.success) throw new Error('json.invalid');

  // El parse laxo garantiza arrays; restoreAll re-cifra con la clave de sesión.
  const snapshot = result.data.data as unknown as DataSnapshot;
  await restoreAll(snapshot);

  return Object.values(result.data.data).reduce<number>(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0,
  );
};
