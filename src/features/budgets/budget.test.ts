import { describe, expect, it } from 'vitest';

import { cents } from '@/lib/money';
import type { Budget, Transaction } from '@/types/domain';

import { budgetStatuses } from './budget';

const txn = (
  amount: number,
  categoryId: string,
  date: string,
): Transaction => ({
  id: `${categoryId}-${date}`,
  type: 'expense',
  amount: cents(amount),
  accountId: 'acc1',
  categoryId,
  date,
  note: '',
  tags: [],
  createdAt: `${date}T00:00:00.000Z`,
});

const budget = (categoryId: string, month: string, limit: number): Budget => ({
  id: `${month}:${categoryId}`,
  categoryId,
  month,
  limit: cents(limit),
});

describe('features/budgets', () => {
  it('compara presupuesto vs gasto real del mes', () => {
    const budgets = [budget('food', '2024-05', 400_00)];
    const txns = [
      txn(150_00, 'food', '2024-05-03'),
      txn(100_00, 'food', '2024-05-10'),
      txn(999_00, 'food', '2024-06-01'), // otro mes, no cuenta
    ];
    const [status] = budgetStatuses(budgets, txns, '2024-05');
    expect(status?.spent).toBe(250_00);
    expect(status?.remaining).toBe(150_00);
    expect(status?.ratio).toBeCloseTo(0.625);
  });

  it('detecta sobregasto (ratio > 1, remaining negativo)', () => {
    const budgets = [budget('fun', '2024-05', 100_00)];
    const txns = [txn(160_00, 'fun', '2024-05-05')];
    const [status] = budgetStatuses(budgets, txns, '2024-05');
    expect(status?.remaining).toBe(-60_00);
    expect(status?.ratio).toBeCloseTo(1.6);
  });
});
