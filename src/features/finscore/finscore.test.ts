import { describe, expect, it } from 'vitest';

import { finScore } from './finscore';

describe('features/finscore', () => {
  it('da puntuacion alta a finanzas saludables', () => {
    const result = finScore({
      savingsRate: 0.35,
      emergencyMonths: 8,
      debtToAssets: 0,
      budgetAdherence: 1,
      netWorthPositive: true,
    });
    expect(result.score).toBe(100);
    expect(result.rating).toBe('excelente');
  });

  it('da puntuacion baja a finanzas fragiles', () => {
    const result = finScore({
      savingsRate: 0,
      emergencyMonths: 0,
      debtToAssets: 1,
      budgetAdherence: 0,
      netWorthPositive: false,
    });
    expect(result.score).toBe(0);
    expect(result.rating).toBe('malo');
  });

  it('clampa sub-indicadores fuera de rango', () => {
    const result = finScore({
      savingsRate: 5, // > 1 tras normalizar, se clampa
      emergencyMonths: 100,
      debtToAssets: -2,
      budgetAdherence: 3,
      netWorthPositive: true,
    });
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('escala correctamente un caso intermedio', () => {
    const result = finScore({
      savingsRate: 0.15, // 0.5 normalizado
      emergencyMonths: 3, // 0.5
      debtToAssets: 0.5, // 0.5
      budgetAdherence: 0.5,
      netWorthPositive: true,
    });
    // 0.5*0.3+0.5*0.25+0.5*0.2+0.5*0.15+1*0.1 = 0.55 -> 55
    expect(result.score).toBe(55);
    expect(result.rating).toBe('regular');
  });
});
