import { describe, expect, it } from 'vitest';

import { advanceDate, dueOccurrences } from './recurring';

describe('features/transactions/recurring', () => {
  it('avanza la fecha segun la frecuencia', () => {
    expect(advanceDate('2024-01-31', 'daily')).toBe('2024-02-01');
    expect(advanceDate('2024-01-01', 'weekly')).toBe('2024-01-08');
    expect(advanceDate('2024-01-15', 'monthly')).toBe('2024-02-15');
    expect(advanceDate('2024-01-15', 'quarterly')).toBe('2024-04-15');
    expect(advanceDate('2024-01-15', 'yearly')).toBe('2025-01-15');
  });

  it('calcula las ocurrencias pendientes hasta hoy', () => {
    const result = dueOccurrences('2024-01-01', 'monthly', '2024-03-15');
    expect(result.dates).toEqual(['2024-01-01', '2024-02-01', '2024-03-01']);
    expect(result.nextRun).toBe('2024-04-01');
  });

  it('no devuelve ocurrencias si nextRun es futuro', () => {
    const result = dueOccurrences('2024-12-01', 'monthly', '2024-03-15');
    expect(result.dates).toEqual([]);
    expect(result.nextRun).toBe('2024-12-01');
  });
});
