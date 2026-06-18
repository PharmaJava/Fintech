/**
 * features/insights/insights — comparativas contra "ti mismo" (puro, testeado).
 *
 * No compara contra otros usuarios (privacidad): solo contra tu propio pasado.
 * Reutiliza el cálculo de patrimonio neto y el resumen mensual existentes.
 *
 * Todo en `Cents`; las tasas/ratios son números adimensionales (Cents/Cents).
 */
import { endOfMonth, format, parseISO, subMonths } from 'date-fns';

import { netWorthAt } from '@/features/networth/networth';
import { monthSummary } from '@/features/transactions/transactions';
import { subtractCents, type Cents } from '@/lib/money';
import type { Asset, Liability, Transaction, Valuation } from '@/types/domain';

/** Datos necesarios para las comparativas (lo que vive en los stores). */
export interface InsightsData {
  assets: readonly Asset[];
  liabilities: readonly Liability[];
  valuations: readonly Valuation[];
  transactions: readonly Transaction[];
}

/** Foto financiera de un mes: patrimonio a fin de mes + flujo del mes. */
export interface MonthlySnapshot {
  month: string; // YYYY-MM
  assets: Cents;
  liabilities: Cents;
  net: Cents;
  income: Cents;
  expense: Cents;
  savings: Cents; // income - expense
}

/** Último día del mes (YYYY-MM) en formato ISO YYYY-MM-DD. */
const endOfMonthIso = (month: string): string =>
  format(endOfMonth(parseISO(`${month}-01`)), 'yyyy-MM-dd');

/**
 * Tasa de ahorro del mes (ahorro / ingresos) como fracción 0..1, o `null` si no
 * hubo ingresos (dividir por cero no tiene sentido).
 */
export const savingsRate = (income: Cents, savings: Cents): number | null =>
  income === 0 ? null : savings / income;

/** Foto financiera de un mes concreto (patrimonio a fin de mes + flujo). */
export const monthlySnapshot = (
  month: string,
  data: InsightsData,
): MonthlySnapshot => {
  const nw = netWorthAt(
    endOfMonthIso(month),
    data.assets,
    data.liabilities,
    data.valuations,
  );
  const flow = monthSummary(data.transactions, month);
  return {
    month,
    assets: nw.assets,
    liabilities: nw.liabilities,
    net: nw.net,
    income: flow.income,
    expense: flow.expense,
    savings: subtractCents(flow.income, flow.expense),
  };
};

/** Punto de la serie de tasa de ahorro de un mes. */
export interface SavingsRatePoint {
  month: string; // YYYY-MM
  income: Cents;
  expense: Cents;
  savings: Cents; // income - expense
  /** Tasa de ahorro (ahorro / ingresos) 0..1, o `null` si no hubo ingresos. */
  rate: number | null;
}

/**
 * Serie de la tasa de ahorro de los últimos `count` meses hasta `endMonth`
 * (inclusive), en orden ascendente. Para ver tu evolución mes a mes.
 */
export const savingsRateSeries = (
  transactions: readonly Transaction[],
  endMonth: string,
  count: number,
): SavingsRatePoint[] => {
  const points: SavingsRatePoint[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const month = format(subMonths(parseISO(`${endMonth}-01`), i), 'yyyy-MM');
    const flow = monthSummary(transactions, month);
    const savings = subtractCents(flow.income, flow.expense);
    points.push({
      month,
      income: flow.income,
      expense: flow.expense,
      savings,
      rate: savingsRate(flow.income, savings),
    });
  }
  return points;
};

/** Comparativa de un mes contra ti mismo `monthsAgo` meses atrás. */
export interface SelfComparison {
  current: MonthlySnapshot;
  previous: MonthlySnapshot;
  monthsApart: number;
  netDelta: Cents;
  /** Variación relativa del patrimonio, o `null` si la base no era positiva. */
  netDeltaRatio: number | null;
  expenseDelta: Cents;
  /** Variación relativa del gasto, o `null` si antes no hubo gasto. */
  expenseDeltaRatio: number | null;
  savingsRateCurrent: number | null;
  savingsRatePrevious: number | null;
  /** Diferencia de tasa de ahorro en puntos (fracción), o `null`. */
  savingsRatePointsDelta: number | null;
}

/**
 * Compara el mes `currentMonth` (YYYY-MM) con el mismo dato `monthsAgo` meses
 * antes: patrimonio, gasto y tasa de ahorro. Solo contra tu propio histórico.
 */
export const compareToSelf = (
  currentMonth: string,
  monthsAgo: number,
  data: InsightsData,
): SelfComparison => {
  const previousMonth = format(
    subMonths(parseISO(`${currentMonth}-01`), monthsAgo),
    'yyyy-MM',
  );
  const current = monthlySnapshot(currentMonth, data);
  const previous = monthlySnapshot(previousMonth, data);

  const netDelta = subtractCents(current.net, previous.net);
  const expenseDelta = subtractCents(current.expense, previous.expense);
  const srCurrent = savingsRate(current.income, current.savings);
  const srPrevious = savingsRate(previous.income, previous.savings);

  return {
    current,
    previous,
    monthsApart: monthsAgo,
    netDelta,
    // Una variación porcentual desde una base <= 0 sería engañosa: la omitimos.
    netDeltaRatio: previous.net > 0 ? netDelta / previous.net : null,
    expenseDelta,
    expenseDeltaRatio:
      previous.expense > 0 ? expenseDelta / previous.expense : null,
    savingsRateCurrent: srCurrent,
    savingsRatePrevious: srPrevious,
    savingsRatePointsDelta:
      srCurrent === null || srPrevious === null ? null : srCurrent - srPrevious,
  };
};
