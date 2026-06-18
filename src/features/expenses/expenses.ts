/**
 * features/expenses/expenses — análisis de gasto del mes (puro, testeado).
 *
 * Trabaja sobre los movimientos de tipo `expense` que ya existen (un gasto ES
 * una transacción): esta feature no introduce entidad nueva, solo vistas y
 * cálculos sobre los datos existentes. Todo en `Cents`; nada de floats.
 */
import { getDaysInMonth, parseISO } from 'date-fns';

import { scaleCents, sumCents, ZERO_CENTS, type Cents } from '@/lib/money';
import type { Transaction } from '@/types/domain';

import { inMonth, monthOf } from '@/features/transactions/transactions';

/** Día (YYYY-MM-DD) de una fecha ISO. */
export const dayOf = (isoDate: string): string => isoDate.slice(0, 10);

/** Suma del gasto (solo `expense`) de un conjunto de movimientos. */
export const totalExpense = (transactions: readonly Transaction[]): Cents =>
  sumCents(
    transactions
      .filter((txn) => txn.type === 'expense')
      .map((txn) => txn.amount),
  );

/**
 * Proyección de gasto de fin de mes (burn rate). Honesta: solo extrapola el
 * ritmo observado hasta `asOf`, no predice nada. En meses pasados el ritmo está
 * completo (días transcurridos = días del mes); en meses futuros no hay datos.
 */
export interface BurnRate {
  /** Gastado en el mes hasta `asOf`. */
  spent: Cents;
  /** Días del mes ya transcurridos (1..daysInMonth, o 0 si es mes futuro). */
  daysElapsed: number;
  /** Días totales del mes. */
  daysInMonth: number;
  /** Gasto medio por día transcurrido. */
  dailyAverage: Cents;
  /** Gasto proyectado a fin de mes al ritmo actual. */
  projected: Cents;
}

export const monthBurnRate = (
  transactions: readonly Transaction[],
  month: string, // YYYY-MM
  asOf: string, // YYYY-MM-DD (hoy)
): BurnRate => {
  const spent = totalExpense(transactions.filter((txn) => inMonth(txn, month)));
  const daysInMonth = getDaysInMonth(parseISO(`${month}-01`));
  const asOfMonth = monthOf(asOf);

  let daysElapsed: number;
  if (asOfMonth > month)
    daysElapsed = daysInMonth; // mes ya terminado
  else if (asOfMonth < month)
    daysElapsed = 0; // mes futuro
  else daysElapsed = Number(asOf.slice(8, 10)); // mes en curso: día del mes
  daysElapsed = Math.min(Math.max(daysElapsed, 0), daysInMonth);

  const dailyAverage =
    daysElapsed > 0 ? scaleCents(spent, 1 / daysElapsed) : ZERO_CENTS;
  const projected =
    daysElapsed > 0 ? scaleCents(spent, daysInMonth / daysElapsed) : spent;

  return { spent, daysElapsed, daysInMonth, dailyAverage, projected };
};

/**
 * Gasto recurrente detectado (heurística de suscripción): mismo concepto e
 * importe repetidos en varios meses distintos. Es una pista, no una verdad
 * absoluta; el usuario decide.
 */
export interface DetectedSubscription {
  /** Clave interna (concepto normalizado + importe). */
  key: string;
  /** Concepto representativo (nota del movimiento). */
  label: string;
  categoryId: string;
  /** Importe recurrente. */
  amount: Cents;
  /** Nº de cargos detectados. */
  occurrences: number;
  /** Nº de meses distintos en los que aparece. */
  months: number;
  /** Fecha del último cargo (YYYY-MM-DD). */
  lastDate: string;
}

/**
 * Detecta posibles suscripciones/gastos fijos: agrupa gastos por concepto +
 * importe y considera recurrente lo que aparece en `minMonths` meses distintos
 * (por defecto 2). Ignora gastos sin concepto (no se pueden identificar).
 */
export const detectSubscriptions = (
  transactions: readonly Transaction[],
  options?: { minMonths?: number },
): DetectedSubscription[] => {
  const minMonths = options?.minMonths ?? 2;
  const groups = new Map<string, Transaction[]>();

  for (const txn of transactions) {
    if (txn.type !== 'expense') continue;
    const note = txn.note.trim();
    if (note === '') continue;
    const key = `${note.toLowerCase()}|${txn.amount}`;
    const list = groups.get(key) ?? [];
    list.push(txn);
    groups.set(key, list);
  }

  const result: DetectedSubscription[] = [];
  for (const [key, list] of groups) {
    const months = new Set(list.map((txn) => monthOf(txn.date)));
    if (months.size < minMonths) continue;
    const latest = [...list].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!latest) continue;
    result.push({
      key,
      label: latest.note.trim(),
      categoryId: latest.categoryId,
      amount: latest.amount,
      occurrences: list.length,
      months: months.size,
      lastDate: dayOf(latest.date),
    });
  }

  return result.sort((a, b) => b.amount - a.amount);
};

/** Total mensual estimado de los gastos fijos detectados. */
export const monthlySubscriptionsTotal = (
  subscriptions: readonly DetectedSubscription[],
): Cents => sumCents(subscriptions.map((sub) => sub.amount));
