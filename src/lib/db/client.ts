/**
 * lib/db/client — instancia unica de Dexie (IndexedDB).
 *
 * Esta es la unica conexion a la base de datos. NADIE accede a estas tablas
 * directamente desde componentes o stores: todo pasa por `lib/repositories`.
 */
import { Dexie, type EntityTable } from 'dexie';

import { applySchema } from './migrations';
import type {
  AppMeta,
  StoredAccount,
  StoredAsset,
  StoredBudget,
  StoredCategory,
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
  appMeta!: EntityTable<AppMeta, 'id'>;

  constructor() {
    super('patrimonio');
    applySchema(this);
  }
}

/** Conexion unica a la base de datos. */
export const db = new PatrimonioDB();
