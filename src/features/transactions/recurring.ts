/**
 * features/transactions/recurring — logica de movimientos recurrentes (pura).
 *
 * Una regla genera movimientos en las fechas que toquen. `dueOccurrences`
 * calcula que fechas estan pendientes (hasta hoy) y cual es el proximo disparo.
 */
import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  format,
  parseISO,
} from 'date-fns';

import type { RecurringFrequency } from '@/types/domain';

/** Avanza una fecha (YYYY-MM-DD) un periodo segun la frecuencia. */
export const advanceDate = (
  isoDate: string,
  frequency: RecurringFrequency,
): string => {
  const date = parseISO(isoDate);
  const advancers: Record<RecurringFrequency, Date> = {
    daily: addDays(date, 1),
    weekly: addWeeks(date, 1),
    monthly: addMonths(date, 1),
    quarterly: addQuarters(date, 1),
    yearly: addYears(date, 1),
  };
  return format(advancers[frequency], 'yyyy-MM-dd');
};

export interface DueResult {
  /** Fechas pendientes (<= today) en las que debe generarse un movimiento. */
  dates: string[];
  /** Nuevo `nextRun` tras consumir las pendientes. */
  nextRun: string;
}

/** Calcula las ocurrencias pendientes de una regla hasta `today` (inclusive). */
export const dueOccurrences = (
  nextRun: string,
  frequency: RecurringFrequency,
  today: string,
): DueResult => {
  const dates: string[] = [];
  let cursor = nextRun;
  // Guarda de seguridad para evitar bucles infinitos por datos corruptos.
  let guard = 0;
  while (cursor <= today && guard < 10_000) {
    dates.push(cursor);
    cursor = advanceDate(cursor, frequency);
    guard += 1;
  }
  return { dates, nextRun: cursor };
};
