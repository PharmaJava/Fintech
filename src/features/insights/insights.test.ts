import { describe, expect, it } from 'vitest';

import { cents } from '@/lib/money';
import type { Asset, Liability, Transaction, Valuation } from '@/types/domain';

import {
  compareToSelf,
  monthlySnapshot,
  savingsRate,
  savingsRateSeries,
} from './insights';

const asset = (id: string): Asset => ({
  id,
  name: id,
  category: 'cash',
  currency: 'EUR',
  createdAt: '2025-01-01T00:00:00.000Z',
});

const valuation = (refId: string, date: string, value: number): Valuation => ({
  id: `${refId}-${date}`,
  refId,
  refType: 'asset',
  value: cents(value),
  date,
  createdAt: `${date}T00:00:00.000Z`,
});

const txn = (
  type: Transaction['type'],
  amount: number,
  date: string,
): Transaction => ({
  id: `${type}-${date}-${amount}`,
  type,
  amount: cents(amount),
  accountId: 'acc',
  categoryId: 'cat',
  date,
  note: '',
  tags: [],
  createdAt: `${date}T00:00:00.000Z`,
});

// Activo valorado en 1.000 € (2025-06) y 1.500 € (2026-06).
const assets: Asset[] = [asset('a1')];
const liabilities: Liability[] = [];
const valuations: Valuation[] = [
  valuation('a1', '2025-06-30', 100_000),
  valuation('a1', '2026-06-30', 150_000),
];
const transactions: Transaction[] = [
  txn('income', 200_000, '2025-06-10'),
  txn('expense', 150_000, '2025-06-15'),
  txn('income', 250_000, '2026-06-10'),
  txn('expense', 144_000, '2026-06-15'),
];
const data = { assets, liabilities, valuations, transactions };

describe('savingsRate', () => {
  it('divide ahorro entre ingresos', () => {
    expect(savingsRate(cents(200_000), cents(50_000))).toBeCloseTo(0.25, 10);
  });

  it('devuelve null sin ingresos (no divide por cero)', () => {
    expect(savingsRate(cents(0), cents(0))).toBeNull();
  });
});

describe('monthlySnapshot', () => {
  it('usa el patrimonio a fin de mes y el flujo del mes', () => {
    const snap = monthlySnapshot('2026-06', data);
    expect(snap.net).toBe(150_000); // valoración 2026-06-30
    expect(snap.income).toBe(250_000);
    expect(snap.expense).toBe(144_000);
    expect(snap.savings).toBe(106_000);
  });

  it('toma la última valoración en o antes de fin de mes', () => {
    // En 2025-12 la valoración vigente sigue siendo la de 2025-06.
    const snap = monthlySnapshot('2025-12', data);
    expect(snap.net).toBe(100_000);
  });

  it('mes sin movimientos: flujo a cero', () => {
    const snap = monthlySnapshot('2026-01', data);
    expect(snap.income).toBe(0);
    expect(snap.expense).toBe(0);
    expect(snap.savings).toBe(0);
  });
});

describe('savingsRateSeries', () => {
  it('devuelve los últimos N meses en orden ascendente con su tasa', () => {
    const series = savingsRateSeries(transactions, '2026-06', 3);
    expect(series.map((p) => p.month)).toEqual([
      '2026-04',
      '2026-05',
      '2026-06',
    ]);
    // El último mes: ahorro 1.060 € / ingresos 2.500 € = 0,424.
    expect(series[2]?.savings).toBe(106_000);
    expect(series[2]?.rate).toBeCloseTo(0.424, 10);
    // Meses sin ingresos → tasa null (no divide por cero).
    expect(series[0]?.rate).toBeNull();
  });
});

describe('compareToSelf', () => {
  it('calcula deltas de patrimonio, gasto y tasa de ahorro', () => {
    const cmp = compareToSelf('2026-06', 12, data);
    expect(cmp.previous.month).toBe('2025-06');
    expect(cmp.netDelta).toBe(50_000); // +500 €
    expect(cmp.netDeltaRatio).toBeCloseTo(0.5, 10);
    expect(cmp.expenseDelta).toBe(-6_000); // gastó 60 € menos
    expect(cmp.expenseDeltaRatio).toBeCloseTo(-0.04, 10);
    expect(cmp.savingsRateCurrent).toBeCloseTo(0.424, 10);
    expect(cmp.savingsRatePrevious).toBeCloseTo(0.25, 10);
    expect(cmp.savingsRatePointsDelta).toBeCloseTo(0.174, 10);
  });

  it('omite el % de patrimonio si la base no era positiva', () => {
    // Activo valorado solo en 2026: a 2025-06 el patrimonio era 0.
    const lateData = {
      assets,
      liabilities,
      valuations: [valuation('a1', '2026-06-30', 150_000)],
      transactions: [],
    };
    const cmp = compareToSelf('2026-06', 12, lateData);
    expect(cmp.previous.net).toBe(0);
    expect(cmp.netDelta).toBe(150_000);
    expect(cmp.netDeltaRatio).toBeNull();
    expect(cmp.expenseDeltaRatio).toBeNull(); // gasto previo 0
    expect(cmp.savingsRatePointsDelta).toBeNull(); // sin ingresos previos
  });
});
