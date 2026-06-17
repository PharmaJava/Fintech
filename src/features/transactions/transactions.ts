/**
 * features/transactions/transactions — calculos de movimientos (puros, testeados).
 *
 * Convencion de signo:
 * - income suma al saldo de la cuenta.
 * - expense y transfer restan del saldo de la cuenta.
 * En los resumenes mensuales solo cuentan income y expense (transfer es neutro).
 */
import {
  addCents,
  subtractCents,
  sumCents,
  ZERO_CENTS,
  type Cents,
} from '@/lib/money';
import type { Transaction } from '@/types/domain';

/** Mes (YYYY-MM) de una fecha ISO/fecha (YYYY-MM-DD). */
export const monthOf = (isoDate: string): string => isoDate.slice(0, 7);

/** `true` si el movimiento cae en el mes dado (YYYY-MM). */
export const inMonth = (txn: Transaction, month: string): boolean =>
  monthOf(txn.date) === month;

export interface MonthSummary {
  income: Cents;
  expense: Cents;
  net: Cents;
}

/** Ingresos, gastos y neto de un mes. */
export const monthSummary = (
  transactions: readonly Transaction[],
  month: string,
): MonthSummary => {
  const monthTxns = transactions.filter((txn) => inMonth(txn, month));
  const income = sumCents(
    monthTxns.filter((txn) => txn.type === 'income').map((txn) => txn.amount),
  );
  const expense = sumCents(
    monthTxns.filter((txn) => txn.type === 'expense').map((txn) => txn.amount),
  );
  return { income, expense, net: subtractCents(income, expense) };
};

/** Gasto por categoria en un mes (solo gastos). */
export const spendingByCategory = (
  transactions: readonly Transaction[],
  month: string,
): Map<string, Cents> => {
  const byCategory = new Map<string, Cents>();
  for (const txn of transactions) {
    if (txn.type !== 'expense' || !inMonth(txn, month)) continue;
    const previous = byCategory.get(txn.categoryId) ?? ZERO_CENTS;
    byCategory.set(txn.categoryId, sumCents([previous, txn.amount]));
  }
  return byCategory;
};

/** Saldo de una cuenta: income suma; expense y transfer restan. */
export const accountBalance = (
  transactions: readonly Transaction[],
  accountId: string,
): Cents =>
  transactions
    .filter((txn) => txn.accountId === accountId)
    .reduce<Cents>(
      (balance, txn) =>
        txn.type === 'income'
          ? addCents(balance, txn.amount)
          : subtractCents(balance, txn.amount),
      ZERO_CENTS,
    );

/** Lista de meses (YYYY-MM) presentes en los movimientos, descendente. */
export const monthsWithActivity = (
  transactions: readonly Transaction[],
): string[] =>
  [...new Set(transactions.map((txn) => monthOf(txn.date)))].sort((a, b) =>
    b.localeCompare(a),
  );
