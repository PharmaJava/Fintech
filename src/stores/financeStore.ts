/**
 * stores/financeStore — estado de movimientos, cuentas, categorias,
 * presupuestos y reglas recurrentes (Fase 2).
 *
 * Carga y escribe SIEMPRE vía repositorios (nunca toca Dexie). Los importes de
 * los formularios llegan en unidad mayor (euros) y se convierten a `Cents` aqui.
 */
import { format } from 'date-fns';
import { create } from 'zustand';

import { matchCategory } from '@/features/transactions/autorules';
import { dueOccurrences } from '@/features/transactions/recurring';
import type { CsvImportRow } from '@/features/transactions/csv';
import { toCents } from '@/lib/money';
import {
  accountRepository,
  autoRuleRepository,
  budgetRepository,
  categoryRepository,
  recurringRuleRepository,
  transactionRepository,
} from '@/lib/repositories';
import type {
  Account,
  AccountType,
  AutoRule,
  Budget,
  Category,
  CategoryKind,
  RecurringFrequency,
  RecurringRule,
  Transaction,
  TransactionType,
} from '@/types/domain';

const today = (): string => format(new Date(), 'yyyy-MM-dd');

const DEFAULT_CATEGORIES: ReadonlyArray<
  Pick<Category, 'name' | 'kind' | 'color'>
> = [
  { name: 'Nomina', kind: 'income', color: '#10b981' },
  { name: 'Otros ingresos', kind: 'income', color: '#22c55e' },
  { name: 'Alimentacion', kind: 'expense', color: '#f59e0b' },
  { name: 'Vivienda', kind: 'expense', color: '#3b82f6' },
  { name: 'Transporte', kind: 'expense', color: '#8b5cf6' },
  { name: 'Ocio', kind: 'expense', color: '#ec4899' },
  { name: 'Otros gastos', kind: 'expense', color: '#64748b' },
];

interface AddTransactionInput {
  type: TransactionType;
  amount: number;
  accountId: string;
  categoryId: string;
  date: string;
  note?: string;
  tags?: string[];
}

interface AddRecurringInput {
  type: TransactionType;
  amount: number;
  accountId: string;
  categoryId: string;
  note?: string;
  frequency: RecurringFrequency;
  nextRun: string;
}

interface FinanceState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  recurringRules: RecurringRule[];
  autoRules: AutoRule[];
  loaded: boolean;

  load: () => Promise<void>;
  seedDefaultCategoriesIfEmpty: () => Promise<void>;

  addAccount: (name: string, type: AccountType) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  addCategory: (
    name: string,
    kind: CategoryKind,
    color: string,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addTransaction: (input: AddTransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  setBudget: (
    categoryId: string,
    month: string,
    limit: number,
  ) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  addRecurringRule: (input: AddRecurringInput) => Promise<void>;
  deleteRecurringRule: (id: string) => Promise<void>;
  materializeDueRecurring: () => Promise<number>;

  importTransactions: (rows: readonly CsvImportRow[]) => Promise<number>;

  addAutoRule: (keyword: string, categoryId: string) => Promise<void>;
  deleteAutoRule: (id: string) => Promise<void>;
  applyAutoRulesToExisting: () => Promise<number>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  recurringRules: [],
  autoRules: [],
  loaded: false,

  load: async () => {
    const [
      accounts,
      categories,
      transactions,
      budgets,
      recurringRules,
      autoRules,
    ] = await Promise.all([
      accountRepository.getAll(),
      categoryRepository.getAll(),
      transactionRepository.getAll(),
      budgetRepository.getAll(),
      recurringRuleRepository.getAll(),
      autoRuleRepository.getAll(),
    ]);
    set({
      accounts,
      categories,
      transactions,
      budgets,
      recurringRules,
      autoRules,
      loaded: true,
    });
  },

  seedDefaultCategoriesIfEmpty: async () => {
    if (get().categories.length > 0) return;
    for (const category of DEFAULT_CATEGORIES) {
      await categoryRepository.add(category);
    }
    set({ categories: await categoryRepository.getAll() });
  },

  addAccount: async (name, type) => {
    await accountRepository.add({ name, type, currency: 'EUR' });
    set({ accounts: await accountRepository.getAll() });
  },

  deleteAccount: async (id) => {
    await accountRepository.delete(id);
    set({ accounts: await accountRepository.getAll() });
  },

  addCategory: async (name, kind, color) => {
    await categoryRepository.add({ name, kind, color });
    set({ categories: await categoryRepository.getAll() });
  },

  deleteCategory: async (id) => {
    await categoryRepository.delete(id);
    set({ categories: await categoryRepository.getAll() });
  },

  addTransaction: async (input) => {
    await transactionRepository.add({
      type: input.type,
      amount: toCents(input.amount),
      accountId: input.accountId,
      categoryId: input.categoryId,
      date: input.date,
      note: input.note ?? '',
      tags: input.tags ?? [],
    });
    set({ transactions: await transactionRepository.getAll() });
  },

  deleteTransaction: async (id) => {
    await transactionRepository.delete(id);
    set({ transactions: await transactionRepository.getAll() });
  },

  setBudget: async (categoryId, month, limit) => {
    await budgetRepository.setBudget({
      categoryId,
      month,
      limit: toCents(limit),
    });
    set({ budgets: await budgetRepository.getAll() });
  },

  deleteBudget: async (id) => {
    await budgetRepository.delete(id);
    set({ budgets: await budgetRepository.getAll() });
  },

  addRecurringRule: async (input) => {
    await recurringRuleRepository.add({
      frequency: input.frequency,
      nextRun: input.nextRun,
      templateTxn: {
        type: input.type,
        amount: toCents(input.amount),
        accountId: input.accountId,
        categoryId: input.categoryId,
        note: input.note ?? '',
        tags: [],
      },
    });
    set({ recurringRules: await recurringRuleRepository.getAll() });
  },

  deleteRecurringRule: async (id) => {
    await recurringRuleRepository.delete(id);
    set({ recurringRules: await recurringRuleRepository.getAll() });
  },

  /** Genera los movimientos pendientes de las reglas recurrentes hasta hoy. */
  materializeDueRecurring: async () => {
    const now = today();
    let created = 0;
    for (const rule of get().recurringRules) {
      const due = dueOccurrences(rule.nextRun, rule.frequency, now);
      if (due.dates.length === 0) continue;
      for (const date of due.dates) {
        await transactionRepository.add({ ...rule.templateTxn, date });
        created += 1;
      }
      await recurringRuleRepository.put({ ...rule, nextRun: due.nextRun });
    }
    if (created > 0) {
      const [transactions, recurringRules] = await Promise.all([
        transactionRepository.getAll(),
        recurringRuleRepository.getAll(),
      ]);
      set({ transactions, recurringRules });
    }
    return created;
  },

  /** Importa filas CSV: resuelve cuenta/categoria por nombre, creando las que falten. */
  importTransactions: async (rows) => {
    const accountByName = new Map(
      get().accounts.map((a) => [a.name.toLowerCase(), a.id]),
    );
    const categoryByName = new Map(
      get().categories.map((c) => [c.name.toLowerCase(), c.id]),
    );

    const resolveAccount = async (name: string): Promise<string> => {
      const existing = accountByName.get(name.toLowerCase());
      if (existing) return existing;
      const account = await accountRepository.add({
        name,
        type: 'bank',
        currency: 'EUR',
      });
      accountByName.set(name.toLowerCase(), account.id);
      return account.id;
    };

    const resolveCategory = async (
      name: string,
      kind: CategoryKind,
    ): Promise<string> => {
      const existing = categoryByName.get(name.toLowerCase());
      if (existing) return existing;
      const category = await categoryRepository.add({
        name,
        kind,
        color: '#64748b',
      });
      categoryByName.set(name.toLowerCase(), category.id);
      return category.id;
    };

    const rules = get().autoRules;
    let created = 0;
    for (const row of rows) {
      const accountId = await resolveAccount(row.account);
      const categoryId = await resolveCategory(
        row.category,
        row.type === 'income' ? 'income' : 'expense',
      );
      // Una regla automatica sobre la nota tiene prioridad en la categoria.
      const finalCategory = matchCategory(row.note, rules) ?? categoryId;
      await transactionRepository.add({
        type: row.type,
        amount: toCents(row.amount),
        accountId,
        categoryId: finalCategory,
        date: row.date,
        note: row.note,
        tags: row.tags === '' ? [] : row.tags.split(';'),
      });
      created += 1;
    }

    await get().load();
    return created;
  },

  addAutoRule: async (keyword, categoryId) => {
    await autoRuleRepository.add({ keyword, categoryId });
    set({ autoRules: await autoRuleRepository.getAll() });
  },

  deleteAutoRule: async (id) => {
    await autoRuleRepository.delete(id);
    set({ autoRules: await autoRuleRepository.getAll() });
  },

  /** Re-categoriza los movimientos existentes segun las reglas; devuelve cuantos cambiaron. */
  applyAutoRulesToExisting: async () => {
    const rules = get().autoRules;
    let changed = 0;
    for (const txn of get().transactions) {
      const target = matchCategory(txn.note, rules);
      if (target && target !== txn.categoryId) {
        await transactionRepository.put({ ...txn, categoryId: target });
        changed += 1;
      }
    }
    if (changed > 0) {
      set({ transactions: await transactionRepository.getAll() });
    }
    return changed;
  },
}));
