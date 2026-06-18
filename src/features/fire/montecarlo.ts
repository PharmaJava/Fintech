/**
 * features/fire/montecarlo — simulacion de Monte Carlo (pura y determinista con
 * RNG sembrado, para poder testearla). El calculo pesado se ejecuta en un Web
 * Worker (montecarlo.worker.ts) para no bloquear la UI.
 *
 * Trabaja en unidad mayor (floats) porque es una ESTIMACION estadistica; los
 * importes de entrada/salida cruzan la frontera como `Cents`.
 */
export interface MonteCarloParams {
  /** Capital invertido inicial (en unidad mayor, euros). */
  initial: number;
  /** Aportacion mensual (euros). */
  monthlyContribution: number;
  /** Horizonte en anos. */
  years: number;
  /** Rentabilidad NOMINAL anual media (p.ej. 0.06). Se ajusta por inflacion. */
  annualReturnMean: number;
  /** Volatilidad anual (desviacion tipica, p.ej. 0.15). */
  annualReturnStd: number;
  /** Objetivo a superar al final, en euros de HOY (euros reales). */
  target: number;
  /** Numero de simulaciones. */
  runs: number;
  /**
   * Inflacion anual esperada (p.ej. 0.02). Convierte la rentabilidad nominal en
   * real, de modo que los resultados quedan en euros de hoy (poder adquisitivo).
   * Por defecto 0 (sin ajuste).
   */
  annualInflation?: number;
}

export interface MonteCarloResult {
  /** Fraccion de simulaciones que terminan >= target. */
  successRate: number;
  /** Percentiles del valor final, en euros de HOY (reales). */
  p10: number;
  p50: number;
  p90: number;
  /** Rentabilidad real anual usada (nominal ajustada por inflacion). */
  realAnnualReturn: number;
}

/** RNG determinista (mulberry32) para resultados reproducibles/testables. */
export const mulberry32 = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Muestra de una normal estandar (Box-Muller) a partir de un RNG uniforme. */
const sampleNormal = (rng: () => number): number => {
  const u1 = Math.max(rng(), Number.EPSILON);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

const percentile = (sortedAsc: number[], p: number): number => {
  if (sortedAsc.length === 0) return 0;
  const index = Math.min(
    sortedAsc.length - 1,
    Math.max(0, Math.round(p * (sortedAsc.length - 1))),
  );
  return sortedAsc[index] ?? 0;
};

/** Ejecuta la simulacion. `seed` permite reproducibilidad (tests). */
export const runMonteCarlo = (
  params: MonteCarloParams,
  seed = 123456789,
): MonteCarloResult => {
  const rng = mulberry32(seed);
  const finals: number[] = [];
  let successes = 0;

  const months = Math.round(params.years * 12);
  // Rentabilidad real = nominal descontada la inflacion (ecuacion de Fisher).
  // Asi todo el resultado queda en euros de hoy y es comparable con el objetivo.
  const inflation = params.annualInflation ?? 0;
  const realAnnualReturn = (1 + params.annualReturnMean) / (1 + inflation) - 1;
  const monthlyMean = (1 + realAnnualReturn) ** (1 / 12) - 1;
  const monthlyStd = params.annualReturnStd / Math.sqrt(12);

  for (let run = 0; run < params.runs; run += 1) {
    let value = params.initial;
    for (let month = 0; month < months; month += 1) {
      const monthlyReturn = monthlyMean + monthlyStd * sampleNormal(rng);
      value = value * (1 + monthlyReturn) + params.monthlyContribution;
    }
    finals.push(value);
    if (value >= params.target) successes += 1;
  }

  finals.sort((a, b) => a - b);
  return {
    successRate: params.runs > 0 ? successes / params.runs : 0,
    p10: percentile(finals, 0.1),
    p50: percentile(finals, 0.5),
    p90: percentile(finals, 0.9),
    realAnnualReturn,
  };
};
