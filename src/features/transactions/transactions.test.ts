import { describe, expect, it } from 'vitest';

import { cents } from '@/lib/money';
import type { Transaction, TransactionType } from '@/types/domain';

import {
  accountBalance,
  monthSummary,
  monthsWithActivity,
  spendingByCategory,
} from './transactions';

const txn = (
  type: TransactionType,
  amount: number,
  date: string,
  accountId = 'acc1',
  categoryId = 'cat1',
): Transaction => ({
  id: `${type}-${date}-${amount}`,
  type,
  amount: cents(amount),
  accountId,
  categoryId,
  date,
  note: '',
  tags: [],
  createdAt: `${date}T00:00:00.000Z`,
});

describe('features/transactions', () => {
  it('resume ingresos, gastos y neto del mes', () => {
    const txns = [
      txn('income', 2_000_00, '2024-05-10'),
      txn('expense', 500_00, '2024-05-12'),
      txn('expense', 300_00, '2024-05-20'),
      txn('income', 999_00, '2024-06-01'),
    ];
    const summary = monthSummary(txns, '2024-05');
    expect(summary.income).toBe(2_000_00);
    expect(summary.expense).toBe(800_00);
    expect(summary.net).toBe(1_200_00);
  });

  it('agrupa el gasto por categoria del mes', () => {
    const txns = [
      txn('expense', 100_00, '2024-05-01', 'acc1', 'food'),
      txn('expense', 50_00, '2024-05-02', 'acc1', 'food'),
      txn('expense', 200_00, '2024-05-03', 'acc1', 'rent'),
      txn('income', 999_00, '2024-05-04', 'acc1', 'salary'),
    ];
    const byCat = spendingByCategory(txns, '2024-05');
    expect(byCat.get('food')).toBe(150_00);
    expect(byCat.get('rent')).toBe(200_00);
    expect(byCat.get('salary')).toBeUndefined();
  });

  it('calcula el saldo de una cuenta (income +, expense/transfer -)', () => {
    const txns = [
      txn('income', 1_000_00, '2024-05-01', 'acc1'),
      txn('expense', 250_00, '2024-05-02', 'acc1'),
      txn('transfer', 100_00, '2024-05-03', 'acc1'),
      txn('income', 5_000_00, '2024-05-04', 'acc2'),
    ];
    expect(accountBalance(txns, 'acc1')).toBe(650_00);
    expect(accountBalance(txns, 'acc2')).toBe(5_000_00);
  });

  it('lista los meses con actividad en orden descendente', () => {
    const txns = [
      txn('income', 1, '2024-03-01'),
      txn('income', 1, '2024-05-01'),
      txn('income', 1, '2024-05-15'),
    ];
    expect(monthsWithActivity(txns)).toEqual(['2024-05', '2024-03']);
  });
});
