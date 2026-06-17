/**
 * lib/repositories/maintenance — operaciones sobre TODOS los datos (snapshot,
 * restauracion, borrado). Se usa para el backup cifrado y el cambio de PIN.
 *
 * Lee/escribe mediante los repositorios (cifrado transparente con la clave de
 * sesion actual). El borrado limpia las tablas de datos, no `appMeta`.
 */
import { db } from '@/lib/db';
import type {
  Account,
  Asset,
  Budget,
  Category,
  Liability,
  RecurringRule,
  Transaction,
  Valuation,
} from '@/types/domain';

import { accountRepository } from './accountRepository';
import { assetRepository } from './assetRepository';
import { budgetRepository } from './budgetRepository';
import { categoryRepository } from './categoryRepository';
import { liabilityRepository } from './liabilityRepository';
import { recurringRuleRepository } from './recurringRuleRepository';
import { transactionRepository } from './transactionRepository';
import { valuationRepository } from './valuationRepository';

export interface DataSnapshot {
  accounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  valuations: Valuation[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  recurringRules: RecurringRule[];
}

/** Lee todos los datos (descifrados) en un snapshot. */
export const snapshotAll = async (): Promise<DataSnapshot> => {
  const [
    accounts,
    assets,
    liabilities,
    valuations,
    transactions,
    categories,
    budgets,
    recurringRules,
  ] = await Promise.all([
    accountRepository.getAll(),
    assetRepository.getAll(),
    liabilityRepository.getAll(),
    valuationRepository.getAll(),
    transactionRepository.getAll(),
    categoryRepository.getAll(),
    budgetRepository.getAll(),
    recurringRuleRepository.getAll(),
  ]);
  return {
    accounts,
    assets,
    liabilities,
    valuations,
    transactions,
    categories,
    budgets,
    recurringRules,
  };
};

/** Borra todos los datos de usuario (no toca `appMeta`). */
export const clearAllData = async (): Promise<void> => {
  await Promise.all([
    db.accounts.clear(),
    db.assets.clear(),
    db.liabilities.clear(),
    db.valuations.clear(),
    db.transactions.clear(),
    db.categories.clear(),
    db.budgets.clear(),
    db.recurringRules.clear(),
  ]);
};

/** Reemplaza todos los datos por los de un snapshot (re-cifra con la clave actual). */
export const restoreAll = async (snapshot: DataSnapshot): Promise<void> => {
  await clearAllData();
  await Promise.all([
    ...snapshot.accounts.map((x) => accountRepository.put(x)),
    ...snapshot.assets.map((x) => assetRepository.put(x)),
    ...snapshot.liabilities.map((x) => liabilityRepository.put(x)),
    ...snapshot.valuations.map((x) => valuationRepository.put(x)),
    ...snapshot.transactions.map((x) => transactionRepository.put(x)),
    ...snapshot.categories.map((x) => categoryRepository.put(x)),
    ...snapshot.budgets.map((x) => budgetRepository.put(x)),
    ...snapshot.recurringRules.map((x) => recurringRuleRepository.put(x)),
  ]);
};
