/**
 * lib/db/client — instancia de Dexie (IndexedDB) del perfil activo.
 *
 * Multi-perfil: cada perfil es una base de datos independiente y cifrada con su
 * propio PIN. El perfil "default" usa el nombre `patrimonio` (datos existentes);
 * el resto usan `patrimonio-<id>`. La BD activa se resuelve de forma diferida vía
 * `getDb()`, de modo que cambiar de perfil re-apunta a la base correcta.
 *
 * NADIE accede a estas tablas directamente desde componentes o stores: todo pasa
 * por `lib/repositories`.
 */
import { Dexie, type EntityTable } from 'dexie';

import { applySchema } from './migrations';
import type {
  AppMeta,
  StoredAccount,
  StoredAsset,
  StoredAutoRule,
  StoredBudget,
  StoredCategory,
  StoredFinancialEvent,
  StoredGoal,
  StoredLiability,
  StoredRecurringRule,
  StoredTransaction,
  StoredValuation,
} from './schema';

export class PatrimonioDB extends Dexie {
  accounts!: EntityTable<StoredAccount, 'id'>;
  assets!: EntityTable<StoredAsset, 'id'>;
  liabilities!: EntityTable<StoredLiability, 'id'>;
  valuations!: EntityTable<StoredValuation, 'id'>;
  transactions!: EntityTable<StoredTransaction, 'id'>;
  categories!: EntityTable<StoredCategory, 'id'>;
  recurringRules!: EntityTable<StoredRecurringRule, 'id'>;
  budgets!: EntityTable<StoredBudget, 'id'>;
  goals!: EntityTable<StoredGoal, 'id'>;
  autoRules!: EntityTable<StoredAutoRule, 'id'>;
  financialEvents!: EntityTable<StoredFinancialEvent, 'id'>;
  appMeta!: EntityTable<AppMeta, 'id'>;

  constructor(name: string) {
    super(name);
    applySchema(this);
  }
}

const DEFAULT_PROFILE_ID = 'default';

/** Nombre de la BD de un perfil. El perfil por defecto conserva `patrimonio`. */
export const profileDbName = (profileId: string): string =>
  profileId === DEFAULT_PROFILE_ID ? 'patrimonio' : `patrimonio-${profileId}`;

let activeDb = new PatrimonioDB(profileDbName(DEFAULT_PROFILE_ID));

/** Devuelve la conexión a la base de datos del perfil activo. */
export const getDb = (): PatrimonioDB => activeDb;

/** Conexión por defecto (perfil principal). Usar `getDb()` cuando importe el perfil activo. */
export const db = activeDb;

/** Cambia el perfil activo, abriendo su base de datos independiente. */
export const setActiveProfile = async (profileId: string): Promise<void> => {
  const name = profileDbName(profileId);
  if (activeDb.name === name) return;
  activeDb.close();
  activeDb = new PatrimonioDB(name);
};

/** Borra por completo la base de datos de un perfil. */
export const deleteProfileDb = async (profileId: string): Promise<void> => {
  await Dexie.delete(profileDbName(profileId));
};
