import { describe, expect, it } from 'vitest';

import {
  buildBankRows,
  parseAmount,
  parseBankCsv,
  parseBankDate,
  parseBankTable,
} from './bankCsv';

describe('features/transactions/bankCsv', () => {
  it('parsea importes en formato español e inglés', () => {
    expect(parseAmount('1.234,56')).toBe(1234.56);
    expect(parseAmount('-50,00 €')).toBe(-50);
    expect(parseAmount('1,234.56')).toBe(1234.56);
    expect(parseAmount('2000')).toBe(2000);
  });

  it('parsea fechas en varios formatos a ISO', () => {
    expect(parseBankDate('01/05/2024')).toBe('2024-05-01');
    expect(parseBankDate('1-5-24')).toBe('2024-05-01');
    expect(parseBankDate('2024-05-01')).toBe('2024-05-01');
    expect(parseBankDate('no es fecha')).toBeNull();
  });

  it('importa un extracto con cabecera, ; y preámbulo', () => {
    const csv = [
      'Cuenta: ES12 3456',
      'Fecha;Concepto;Importe;Saldo',
      '01/05/2024;Compra MERCADONA;-45,20;1.000,00',
      '02/05/2024;Nómina ACME;2.000,00;3.000,00',
    ].join('\n');
    const { rows, errors } = parseBankCsv(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      date: '2024-05-01',
      concept: 'Compra MERCADONA',
      amount: -45.2,
    });
    expect(rows[1]?.amount).toBe(2000);
  });

  it('expone tabla y mapeo, y permite mapeo manual de columnas', () => {
    const csv = [
      'F.Valor|Detalle movimiento|Cargo/Abono',
      '03/05/2024|Recibo|-30,00',
      '04/05/2024|Ingreso|100,00',
    ].join('\n');
    const table = parseBankTable(csv);
    expect(table.delimiter).toBe('|');
    expect(table.headers).toHaveLength(3);
    // El usuario corrige el mapeo manualmente por índice.
    const mapped = buildBankRows(table, {
      date: 0,
      concept: 1,
      amount: 2,
      credit: -1,
      debit: -1,
    });
    expect(mapped.rows).toHaveLength(2);
    expect(mapped.rows[1]).toMatchObject({ concept: 'Ingreso', amount: 100 });
  });

  it('soporta columnas Debe/Haber', () => {
    const csv = [
      'Fecha,Descripcion,Debe,Haber',
      '2024-05-03,Recibo luz,60.00,0',
      '2024-05-04,Devolucion,0,15.00',
    ].join('\n');
    const { rows } = parseBankCsv(csv);
    expect(rows[0]?.amount).toBe(-60);
    expect(rows[1]?.amount).toBe(15);
  });
});
