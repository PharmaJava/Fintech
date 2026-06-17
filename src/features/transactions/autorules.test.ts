import { describe, expect, it } from 'vitest';

import type { AutoRule } from '@/types/domain';

import { matchCategory } from './autorules';

const rule = (keyword: string, categoryId: string): AutoRule => ({
  id: `${keyword}`,
  keyword,
  categoryId,
});

describe('features/transactions/autorules', () => {
  const rules = [rule('mercadona', 'food'), rule('netflix', 'fun')];

  it('asigna categoria si la nota contiene la keyword (sin distinguir mayusculas)', () => {
    expect(matchCategory('Compra MERCADONA centro', rules)).toBe('food');
    expect(matchCategory('Suscripcion Netflix', rules)).toBe('fun');
  });

  it('devuelve undefined si nada coincide', () => {
    expect(matchCategory('Gasolinera', rules)).toBeUndefined();
  });

  it('respeta el orden (primera coincidencia gana)', () => {
    const ordered = [rule('a', 'first'), rule('ab', 'second')];
    expect(matchCategory('abc', ordered)).toBe('first');
  });
});
