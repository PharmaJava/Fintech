/**
 * lib/format — formateo de presentacion (moneda y fechas) para la UI.
 *
 * La moneda/locale de visualización es configurable (multidivisa). Se mantiene
 * una config en memoria que sincroniza el settingsStore (ver providers).
 */
import { format, parseISO } from 'date-fns';

import { formatMoney, type Cents } from '@/lib/money';

let moneyConfig: { locale: string; currency: string } = {
  locale: 'es-ES',
  currency: 'EUR',
};

/** Actualiza la moneda/locale de visualización (sincronizado con settingsStore). */
export const setMoneyFormat = (locale: string, currency: string): void => {
  moneyConfig = { locale, currency };
};

/** Formatea un importe `Cents` en la moneda de visualización (p.ej. "1.234,56 €"). */
export const formatEur = (value: Cents): string =>
  formatMoney(value, moneyConfig.locale, moneyConfig.currency);

/** Formatea una fecha ISO (YYYY-MM-DD o timestamp) como "dd/MM/yyyy". */
export const formatDate = (isoDate: string): string =>
  format(parseISO(isoDate), 'dd/MM/yyyy');
