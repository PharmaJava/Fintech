/**
 * lib/format — formateo de presentacion (moneda y fechas) para la UI.
 *
 * Centraliza el locale para que toda la UI muestre los importes y fechas igual.
 */
import { format, parseISO } from 'date-fns';

import { formatMoney, type Cents } from '@/lib/money';

const LOCALE = 'es-ES';
const CURRENCY = 'EUR';

/** Formatea un importe `Cents` como euros (p.ej. "1.234,56 €"). */
export const formatEur = (value: Cents): string =>
  formatMoney(value, LOCALE, CURRENCY);

/** Formatea una fecha ISO (YYYY-MM-DD o timestamp) como "dd/MM/yyyy". */
export const formatDate = (isoDate: string): string =>
  format(parseISO(isoDate), 'dd/MM/yyyy');
