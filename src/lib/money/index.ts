/**
 * lib/money — aritmetica monetaria segura.
 *
 * Principio no negociable: el dinero se guarda SIEMPRE como entero en la unidad
 * minima (centimos). Prohibido usar floats para aritmetica monetaria. Toda
 * operacion con dinero pasa por este modulo.
 */

/** Dinero como entero en la unidad minima (centimos), con marca de tipo. */
export type Cents = number & { readonly __brand: 'Cents' };

const assertSafeInteger = (value: number): void => {
  if (!Number.isInteger(value) || !Number.isSafeInteger(value)) {
    throw new RangeError(
      `El importe en centimos debe ser un entero seguro: ${value}`,
    );
  }
};

/** Construye un valor `Cents` a partir de un entero ya expresado en centimos. */
export const cents = (value: number): Cents => {
  assertSafeInteger(value);
  return value as Cents;
};

/** Valor monetario cero. */
export const ZERO_CENTS = cents(0);

/**
 * Convierte un importe en unidad mayor (p.ej. euros: 19.99) a `Cents` (1999),
 * redondeando al centimo mas cercano de forma estable.
 */
export const toCents = (majorUnits: number): Cents => {
  if (!Number.isFinite(majorUnits)) {
    throw new RangeError(`Importe invalido: ${majorUnits}`);
  }
  // El +Number.EPSILON evita errores de redondeo tipo 1.005 -> 1.00.
  return cents(Math.round((majorUnits + Number.EPSILON) * 100));
};

/** Convierte `Cents` a unidad mayor (number) SOLO para presentacion/formateo. */
export const fromCents = (value: Cents): number => value / 100;

/** Suma dos importes. */
export const addCents = (a: Cents, b: Cents): Cents => cents(a + b);

/** Resta `b` de `a`. */
export const subtractCents = (a: Cents, b: Cents): Cents => cents(a - b);

/** Cambia el signo de un importe. */
export const negateCents = (value: Cents): Cents => cents(-value);

/** Suma una lista de importes. */
export const sumCents = (values: readonly Cents[]): Cents =>
  cents(values.reduce<number>((acc, value) => acc + value, 0));

/**
 * Multiplica un importe por un factor adimensional (cantidad, tasa, %) y
 * redondea al centimo. Usar p.ej. para intereses o reparto proporcional.
 */
export const scaleCents = (value: Cents, factor: number): Cents => {
  if (!Number.isFinite(factor)) {
    throw new RangeError(`Factor invalido: ${factor}`);
  }
  return cents(Math.round(value * factor));
};

/** Formatea un importe como moneda local (p.ej. "1.234,56 €"). */
export const formatMoney = (
  value: Cents,
  locale: string,
  currency: string,
): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    fromCents(value),
  );
