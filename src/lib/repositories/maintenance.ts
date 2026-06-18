/**
 * lib/repositories/maintenance — operaciones sobre TODOS los datos (snapshot,
 * restauracion, borrado). Se usa para el backup cifrado y el cambio de PIN.
 *
 * Lee/escribe mediante los repositorios (cifrado transparente con la clave de
 * sesion actual). El borrado limpia las tablas de datos, no `appMeta`.
 */
import { getDb } from '@/lib/db';
import type {
  Account,
  Asset,
  AutoRule,
  Budget,
  Category,
  FinancialEvent,
  Goal,
  Liability,
  RecurringRule,
  Transaction,
  Valuation,
} from '@/types/domain';

import { accountRepository } from './accountRepository';
import { assetRepository } from './assetRepository';
import { autoRuleRepository } from './autoRuleRepository';
import { budgetRepository } from './budgetRepository';
import { categoryRepository } from './categoryRepository';
import { financialEventRepository } from './financialEventRepository';
import { goalRepository } from './goalRepository';
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
  goals: Goal[];
  autoRules: AutoRule[];
  /** Opcional: los backups antiguos (anteriores al timeline) no lo incluyen. */
  events?: FinancialEvent[];
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
    goals,
    autoRules,
    events,
  ] = await Promise.all([
    accountRepository.getAll(),
    assetRepository.getAll(),
    liabilityRepository.getAll(),
    valuationRepository.getAll(),
    transactionRepository.getAll(),
    categoryRepository.getAll(),
    budgetRepository.getAll(),
    recurringRuleRepository.getAll(),
    goalRepository.getAll(),
    autoRuleRepository.getAll(),
    financialEventRepository.getAll(),
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
    goals,
    autoRules,
    events,
  };
};

/** Borra todos los datos de usuario (no toca `appMeta`). */
export const clearAllData = async (): Promise<void> => {
  await Promise.all([
    getDb().accounts.clear(),
    getDb().assets.clear(),
    getDb().liabilities.clear(),
    getDb().valuations.clear(),
    getDb().transactions.clear(),
    getDb().categories.clear(),
    getDb().budgets.clear(),
    getDb().recurringRules.clear(),
    getDb().goals.clear(),
    getDb().autoRules.clear(),
    getDb().financialEvents.clear(),
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
    ...snapshot.goals.map((x) => goalRepository.put(x)),
    ...snapshot.autoRules.map((x) => autoRuleRepository.put(x)),
    ...(snapshot.events ?? []).map((x) => financialEventRepository.put(x)),
  ]);
};
