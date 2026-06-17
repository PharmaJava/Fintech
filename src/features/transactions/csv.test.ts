import { describe, expect, it } from 'vitest';

import { cents } from '@/lib/money';

import { parseTransactionsCsv, toCsv } from './csv';

describe('features/transactions/csv', () => {
  it('exporta movimientos a CSV con cabecera', () => {
    const csv = toCsv([
      {
        date: '2024-05-01',
        type: 'expense',
        amountCents: cents(1234),
        account: 'Cuenta',
        category: 'Comida',
        note: 'menu, del dia',
        tags: ['a', 'b'],
      },
    ]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('date,type,amount,account,category,note,tags');
    // El importe se exporta en unidad mayor y la nota con coma va entre comillas.
    expect(lines[1]).toBe(
      '2024-05-01,expense,12.34,Cuenta,Comida,"menu, del dia",a;b',
    );
  });

  it('parsea y valida un CSV (ida y vuelta)', () => {
    const csv = [
      'date,type,amount,account,category,note,tags',
      '2024-05-01,expense,12.34,Cuenta,Comida,"menu, del dia",a;b',
      '2024-05-02,income,2000,Cuenta,Nomina,,',
    ].join('\n');
    const result = parseTransactionsCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toMatchObject({
      date: '2024-05-01',
      type: 'expense',
      amount: 12.34,
      account: 'Cuenta',
      category: 'Comida',
      note: 'menu, del dia',
    });
  });

  it('reporta filas invalidas con su numero de linea', () => {
    const csv = [
      'date,type,amount,account,category,note,tags',
      '2024-13-99,expense,10,Cuenta,Comida,,',
      'bad-row',
    ].join('\n');
    const result = parseTransactionsCsv(csv);
    expect(result.rows).toHaveLength(0);
    expect(result.errors.length).toBe(2);
    expect(result.errors[0]?.line).toBe(2);
  });
});
