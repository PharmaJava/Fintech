import { describe, expect, it } from 'vitest';

import { cents } from '@/lib/money';
import type { Transaction, TransactionType } from '@/types/domain';

import {
  detectSubscriptions,
  monthBurnRate,
  monthlySubscriptionsTotal,
  totalExpense,
} from './expenses';

let seq = 0;
const txn = (
  date: string,
  amountCents: number,
  opts: Partial<Pick<Transaction, 'type' | 'note' | 'categoryId'>> = {},
): Transaction => ({
  id: `t${(seq += 1)}`,
  type: opts.type ?? ('expense' as TransactionType),
  amount: cents(amountCents),
  accountId: 'acc',
  categoryId: opts.categoryId ?? 'cat',
  date,
  note: opts.note ?? '',
  tags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
});

describe('features/expenses', () => {
  it('totalExpense suma solo los gastos', () => {
    const list = [
      txn('2026-06-01', 1000),
      txn('2026-06-02', 500, { type: 'income' }),
      txn('2026-06-03', 250),
    ];
    expect(totalExpense(list)).toBe(1250);
  });

  it('monthBurnRate proyecta el gasto al ritmo del mes en curso', () => {
    // 300,00 € en 10 días de un mes de 30 → 30,00 €/día → 900,00 € proyectado.
    const list = [txn('2026-06-05', 20_000), txn('2026-06-09', 10_000)];
    const br = monthBurnRate(list, '2026-06', '2026-06-10');
    expect(br.spent).toBe(30_000);
    expect(br.daysElapsed).toBe(10);
    expect(br.daysInMonth).toBe(30);
    expect(br.dailyAverage).toBe(3_000);
    expect(br.projected).toBe(90_000);
  });

  it('monthBurnRate en un mes pasado no extrapola (ritmo completo)', () => {
    const list = [txn('2026-05-15', 50_000)];
    const br = monthBurnRate(list, '2026-05', '2026-06-10');
    expect(br.daysElapsed).toBe(31);
    expect(br.projected).toBe(br.spent);
  });

  it('monthBurnRate en un mes futuro no proyecta nada', () => {
    const br = monthBurnRate([], '2026-12', '2026-06-10');
    expect(br.daysElapsed).toBe(0);
    expect(br.spent).toBe(0);
    expect(br.projected).toBe(0);
    expect(br.dailyAverage).toBe(0);
  });

  it('detectSubscriptions agrupa por concepto+importe en varios meses', () => {
    const list = [
      txn('2026-04-03', 1299, { note: 'Netflix' }),
      txn('2026-05-03', 1299, { note: 'Netflix' }),
      txn('2026-06-03', 1299, { note: 'netflix' }), // normaliza mayúsculas
      txn('2026-06-04', 4500, { note: 'Compra puntual' }), // un solo mes
      txn('2026-06-05', 800), // sin nota: se ignora
    ];
    const subs = detectSubscriptions(list);
    expect(subs).toHaveLength(1);
    expect(subs[0]?.label).toBe('netflix');
    expect(subs[0]?.amount).toBe(1299);
    expect(subs[0]?.occurrences).toBe(3);
    expect(subs[0]?.months).toBe(3);
    expect(subs[0]?.lastDate).toBe('2026-06-03');
  });

  it('detectSubscriptions distingue importes distintos del mismo concepto', () => {
    const list = [
      txn('2026-05-01', 1000, { note: 'Gym' }),
      txn('2026-06-01', 1000, { note: 'Gym' }),
      txn('2026-05-01', 2000, { note: 'Gym' }),
      txn('2026-06-01', 2000, { note: 'Gym' }),
    ];
    const subs = detectSubscriptions(list);
    expect(subs).toHaveLength(2);
    // Orden descendente por importe.
    expect(subs[0]?.amount).toBe(2000);
    expect(monthlySubscriptionsTotal(subs)).toBe(3000);
  });
});
