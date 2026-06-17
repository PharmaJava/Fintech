/**
 * features/finscore/finscore — indicador de salud financiera (0..100, puro).
 *
 * Combina varios sub-indicadores con pesos. Cada uno se normaliza a 0..1 y se
 * pondera; el total se escala a 0..100. Es una heuristica orientativa.
 */
export interface FinScoreInput {
  /** Tasa de ahorro del mes (ahorro / ingresos), 0..1. */
  savingsRate: number;
  /** Meses de gastos cubiertos por el colchon liquido. */
  emergencyMonths: number;
  /** Pasivos / activos (0 = sin deuda). */
  debtToAssets: number;
  /** Adherencia al presupuesto (0..1; 1 = dentro de todos los limites). */
  budgetAdherence: number;
  /** `true` si el patrimonio neto es positivo. */
  netWorthPositive: boolean;
}

export interface FinScoreResult {
  score: number; // 0..100
  rating: 'malo' | 'regular' | 'bueno' | 'excelente';
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const ratingOf = (score: number): FinScoreResult['rating'] => {
  if (score >= 80) return 'excelente';
  if (score >= 60) return 'bueno';
  if (score >= 40) return 'regular';
  return 'malo';
};

/** Calcula el FinScore (0..100) a partir de los sub-indicadores. */
export const finScore = (input: FinScoreInput): FinScoreResult => {
  // Normalizacion de cada sub-indicador a 0..1.
  const savings = clamp01(input.savingsRate / 0.3); // 30% ahorro = pleno
  const emergency = clamp01(input.emergencyMonths / 6); // 6 meses = pleno
  const debt = clamp01(1 - input.debtToAssets); // menos deuda, mejor
  const budget = clamp01(input.budgetAdherence);
  const positive = input.netWorthPositive ? 1 : 0;

  // Pesos (suman 1).
  const weighted =
    savings * 0.3 +
    emergency * 0.25 +
    debt * 0.2 +
    budget * 0.15 +
    positive * 0.1;

  const score = Math.round(clamp01(weighted) * 100);
  return { score, rating: ratingOf(score) };
};
