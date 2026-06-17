/**
 * features/budgets/budget — comparacion presupuesto vs real (pura, testeada).
 */
import { subtractCents, ZERO_CENTS, type Cents } from '@/lib/money';
import type { Budget, Transaction } from '@/types/domain';

import { spendingByCategory } from '@/features/transactions/transactions';

export interface BudgetStatus {
  categoryId: string;
  limit: Cents;
  spent: Cents;
  remaining: Cents;
  /** Proporcion gastada (0..N). Puede superar 1 si hay sobregasto. */
  ratio: number;
}

/** Estado de cada presupuesto del mes frente al gasto real. */
export const budgetStatuses = (
  budgets: readonly Budget[],
  transactions: readonly Transaction[],
  month: string,
): BudgetStatus[] => {
  const spending = spendingByCategory(transactions, month);
  return budgets
    .filter((budget) => budget.month === month)
    .map((budget) => {
      const spent = spending.get(budget.categoryId) ?? ZERO_CENTS;
      return {
        categoryId: budget.categoryId,
        limit: budget.limit,
        spent,
        remaining: subtractCents(budget.limit, spent),
        ratio: budget.limit > 0 ? spent / budget.limit : 0,
      };
    });
};
