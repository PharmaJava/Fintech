import { describe, expect, it } from 'vitest';

import { parseAmount, parseBankCsv, parseBankDate } from './bankCsv';

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
