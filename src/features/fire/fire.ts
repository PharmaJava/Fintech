/**
 * features/fire/fire — motor de Independencia Financiera (deterministico, puro).
 *
 * - FI number: capital necesario para vivir de las rentas segun una SWR.
 * - yearsToFI: anos hasta alcanzar el FI number aportando e invirtiendo.
 *
 * Importes en `Cents`. Las proyecciones son ESTIMACIONES (interes compuesto),
 * no aritmetica monetaria exacta; el resultado se redondea a `Cents`.
 */
import { cents, fromCents, type Cents } from '@/lib/money';

/** Tasa de retiro segura por defecto (regla del 4%). */
export const DEFAULT_SWR = 0.04;

/** Capital necesario (FI number) = gastos anuales / SWR. */
export const fiNumber = (
  annualExpenses: Cents,
  swr: number = DEFAULT_SWR,
): Cents => {
  if (swr <= 0) throw new RangeError('La SWR debe ser positiva.');
  return cents(Math.round(annualExpenses / swr));
};

export interface YearsToFIInput {
  current: Cents;
  monthlyContribution: Cents;
  annualReturn: number;
  target: Cents;
  maxYears?: number;
}

/**
 * Anos (fraccionados) hasta alcanzar `target` con interes compuesto mensual.
 * Devuelve `null` si no se alcanza en `maxYears` (por defecto 100).
 */
export const yearsToFI = ({
  current,
  monthlyContribution,
  annualReturn,
  target,
  maxYears = 100,
}: YearsToFIInput): number | null => {
  if (current >= target) return 0;
  const monthlyRate = (1 + annualReturn) ** (1 / 12) - 1;
  const maxMonths = Math.round(maxYears * 12);
  let value = fromCents(current);
  const goal = fromCents(target);
  const contribution = fromCents(monthlyContribution);

  for (let month = 1; month <= maxMonths; month += 1) {
    value = value * (1 + monthlyRate) + contribution;
    if (value >= goal) {
      return Math.round((month / 12) * 100) / 100;
    }
  }
  return null;
};

/** Valor proyectado tras `years` anos (interes compuesto mensual). */
export const projectValue = (
  current: Cents,
  monthlyContribution: Cents,
  annualReturn: number,
  years: number,
): Cents => {
  const monthlyRate = (1 + annualReturn) ** (1 / 12) - 1;
  const months = Math.round(years * 12);
  let value = fromCents(current);
  const contribution = fromCents(monthlyContribution);
  for (let month = 0; month < months; month += 1) {
    value = value * (1 + monthlyRate) + contribution;
  }
  return cents(Math.round(value * 100));
};
