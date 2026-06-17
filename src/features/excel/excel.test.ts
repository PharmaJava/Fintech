import { describe, expect, it } from 'vitest';

import { cents } from '@/lib/money';
import type { DataSnapshot } from '@/lib/repositories/maintenance';

import { buildWorkbook } from './buildWorkbook';
import { parseWorkbook } from './importWorkbook';

const emptySnapshot = (): DataSnapshot => ({
  accounts: [],
  assets: [],
  liabilities: [],
  valuations: [],
  transactions: [],
  categories: [],
  budgets: [],
  recurringRules: [],
  goals: [],
  autoRules: [],
});

describe('features/excel (bidireccional)', () => {
  it('round-trip: exporta y vuelve a importar manteniendo id, tipo e importe', async () => {
    const snapshot = emptySnapshot();
    snapshot.accounts = [
      {
        id: 'a1',
        name: 'Banco',
        type: 'bank',
        currency: 'EUR',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ];
    snapshot.categories = [
      { id: 'c1', name: 'Comida', kind: 'expense', color: '#000000' },
    ];
    snapshot.transactions = [
      {
        id: 't1',
        type: 'expense',
        amount: cents(1234),
        accountId: 'a1',
        categoryId: 'c1',
        date: '2024-05-01',
        note: 'menu',
        tags: [],
        createdAt: '2024-05-01T00:00:00.000Z',
      },
    ];

    const workbook = buildWorkbook(snapshot);
    const buffer = await workbook.xlsx.writeBuffer();
    const parsed = await parseWorkbook(buffer as ArrayBuffer);

    expect(parsed.errors).toHaveLength(0);
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0]).toMatchObject({
      id: 't1',
      type: 'expense',
      account: 'Banco',
      category: 'Comida',
      date: '2024-05-01',
      amount: 12.34,
    });
  });
});
