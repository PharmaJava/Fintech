/**
 * lib/db/migrations — definicion versionada del esquema Dexie.
 *
 * Cada version declara sus `stores` (y, si hace falta, una funcion `upgrade`
 * para transformar datos existentes). NUNCA bajes la version ni borres una
 * version anterior: solo se anaden versiones nuevas. Para datos cifrados, las
 * migraciones que toquen valores sensibles necesitan la clave de sesion (la
 * app debe estar desbloqueada); ver skill `dexie-migration`.
 *
 * Importante: en los `stores` SOLO se indexan campos no sensibles (en claro).
 * Los campos cifrados (EncryptedValue) nunca se indexan.
 */
import type { Dexie, Transaction } from 'dexie';

/** Version actual del esquema de datos. */
export const SCHEMA_VERSION = 3;

interface SchemaVersion {
  version: number;
  stores: Record<string, string>;
  upgrade?: (tx: Transaction) => Promise<void> | void;
}

/** Historial de versiones del esquema. Anadir nuevas al final, nunca modificar las antiguas. */
export const SCHEMA_VERSIONS: readonly SchemaVersion[] = [
  {
    version: 1,
    stores: {
      accounts: 'id, type, currency, createdAt',
      assets: 'id, category, currency, createdAt',
      liabilities: 'id, createdAt',
      valuations: 'id, refId, refType, date, createdAt, [refType+refId]',
      transactions: 'id, type, accountId, categoryId, date, createdAt',
      categories: 'id, kind, parentId',
      recurringRules: 'id, frequency, nextRun',
      budgets: 'id, categoryId, month, [categoryId+month]',
      goals: 'id, targetDate',
      appMeta: 'id',
    },
  },
  {
    // v2: reglas de auto-categorizacion (Fase 6).
    version: 2,
    stores: {
      autoRules: 'id, categoryId',
    },
  },
  {
    // v3: eventos de la cronologia financiera (timeline).
    version: 3,
    stores: {
      financialEvents: 'id, date, kind, createdAt',
    },
  },
];

/** Aplica todas las versiones del esquema a la instancia Dexie. */
export const applySchema = (db: Dexie): void => {
  for (const { version, stores, upgrade } of SCHEMA_VERSIONS) {
    const versionInstance = db.version(version).stores(stores);
    if (upgrade) {
      versionInstance.upgrade(upgrade);
    }
  }
};
