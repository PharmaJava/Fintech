import { describe, expect, it } from 'vitest';

import {
  addCents,
  cents,
  formatMoney,
  fromCents,
  negateCents,
  scaleCents,
  subtractCents,
  sumCents,
  toCents,
  ZERO_CENTS,
} from './index';

describe('lib/money', () => {
  describe('cents', () => {
    it('acepta enteros', () => {
      expect(cents(1999)).toBe(1999);
    });

    it('rechaza no-enteros', () => {
      expect(() => cents(19.99)).toThrow(RangeError);
    });
  });

  describe('toCents', () => {
    it('convierte unidades mayores a centimos redondeando', () => {
      expect(toCents(19.99)).toBe(1999);
      expect(toCents(0)).toBe(0);
      expect(toCents(1)).toBe(100);
    });

    it('redondea de forma estable casos problematicos de floats', () => {
      expect(toCents(1.005)).toBe(101);
      expect(toCents(0.1 + 0.2)).toBe(30);
    });

    it('rechaza valores no finitos', () => {
      expect(() => toCents(Number.NaN)).toThrow(RangeError);
      expect(() => toCents(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    });
  });

  describe('fromCents', () => {
    it('convierte centimos a unidad mayor', () => {
      expect(fromCents(cents(1999))).toBe(19.99);
    });
  });

  describe('aritmetica', () => {
    it('suma y resta', () => {
      expect(addCents(cents(150), cents(250))).toBe(400);
      expect(subtractCents(cents(500), cents(150))).toBe(350);
    });

    it('niega', () => {
      expect(negateCents(cents(150))).toBe(-150);
    });

    it('suma listas', () => {
      expect(sumCents([cents(100), cents(200), cents(300)])).toBe(600);
      expect(sumCents([])).toBe(ZERO_CENTS);
    });

    it('escala por un factor y redondea', () => {
      expect(scaleCents(cents(10000), 0.035)).toBe(350);
      expect(scaleCents(cents(333), 3)).toBe(999);
    });
  });

  describe('formatMoney', () => {
    it('formatea en es-ES con EUR (coma decimal y simbolo)', () => {
      const formatted = formatMoney(cents(123456), 'es-ES', 'EUR');
      // No comprobamos el separador de miles porque depende de los datos ICU
      // disponibles en el entorno (CI vs local).
      expect(formatted).toContain(',56');
      expect(formatted).toContain('€');
    });
  });
});
