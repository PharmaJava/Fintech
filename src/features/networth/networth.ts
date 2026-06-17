/**
 * features/networth/networth — calculo de patrimonio neto (puro, testeado).
 *
 * Patrimonio neto = valor de los activos - valor de los pasivos, en una fecha.
 * El valor de cada activo/pasivo es su valoracion (`Valuation`) mas reciente en
 * o antes de la fecha; para un pasivo sin valoracion se usa su `principal`.
 *
 * Todo en `Cents`; nunca floats (ver skill money-and-calc).
 */
import { subtractCents, sumCents, ZERO_CENTS, type Cents } from '@/lib/money';
import type {
  Asset,
  AssetCategory,
  Liability,
  RefType,
  Valuation,
} from '@/types/domain';

export interface NetWorthBreakdown {
  assets: Cents;
  liabilities: Cents;
  net: Cents;
}

export interface NetWorthPoint {
  date: string;
  net: Cents;
}

/** Valoraciones de un activo/pasivo concreto. */
export const valuationsFor = (
  valuations: readonly Valuation[],
  refType: RefType,
  refId: string,
): Valuation[] =>
  valuations.filter((v) => v.refType === refType && v.refId === refId);

/**
 * Valoracion mas reciente (por fecha) en o antes de `asOf`. Si no se pasa `asOf`,
 * devuelve la mas reciente de todas.
 */
export const latestValuation = (
  valuations: readonly Valuation[],
  asOf?: string,
): Valuation | undefined => {
  const candidates =
    asOf === undefined ? valuations : valuations.filter((v) => v.date <= asOf);
  return candidates.reduce<Valuation | undefined>(
    (latest, current) =>
      latest === undefined || current.date > latest.date ? current : latest,
    undefined,
  );
};

/** Valor actual de un activo: su ultima valoracion, o 0 si no tiene. */
export const assetValue = (
  asset: Asset,
  valuations: readonly Valuation[],
  asOf?: string,
): Cents => {
  const latest = latestValuation(
    valuationsFor(valuations, 'asset', asset.id),
    asOf,
  );
  return latest?.value ?? ZERO_CENTS;
};

/** Valor actual de un pasivo: su ultima valoracion, o el principal si no tiene. */
export const liabilityValue = (
  liability: Liability,
  valuations: readonly Valuation[],
  asOf?: string,
): Cents => {
  const latest = latestValuation(
    valuationsFor(valuations, 'liability', liability.id),
    asOf,
  );
  return latest?.value ?? liability.principal;
};

/** Desglose del patrimonio neto (activos, pasivos, neto) en una fecha. */
export const netWorthAt = (
  asOf: string | undefined,
  assets: readonly Asset[],
  liabilities: readonly Liability[],
  valuations: readonly Valuation[],
): NetWorthBreakdown => {
  const assetTotal = sumCents(
    assets.map((a) => assetValue(a, valuations, asOf)),
  );
  const liabilityTotal = sumCents(
    liabilities.map((l) => liabilityValue(l, valuations, asOf)),
  );
  return {
    assets: assetTotal,
    liabilities: liabilityTotal,
    net: subtractCents(assetTotal, liabilityTotal),
  };
};

/** Patrimonio neto actual (sin fecha de corte). */
export const currentNetWorth = (
  assets: readonly Asset[],
  liabilities: readonly Liability[],
  valuations: readonly Valuation[],
): NetWorthBreakdown => netWorthAt(undefined, assets, liabilities, valuations);

/**
 * Serie temporal del patrimonio neto: un punto por cada fecha en la que hubo
 * alguna valoracion, ordenada ascendentemente. Base de la curva de riqueza.
 */
export const netWorthSeries = (
  assets: readonly Asset[],
  liabilities: readonly Liability[],
  valuations: readonly Valuation[],
): NetWorthPoint[] => {
  const dates = [...new Set(valuations.map((v) => v.date))].sort((a, b) =>
    a.localeCompare(b),
  );
  return dates.map((date) => ({
    date,
    net: netWorthAt(date, assets, liabilities, valuations).net,
  }));
};

/** Valor actual agrupado por categoria de activo (para desglose/tarta). */
export const assetsByCategory = (
  assets: readonly Asset[],
  valuations: readonly Valuation[],
  asOf?: string,
): Map<AssetCategory, Cents> => {
  const byCategory = new Map<AssetCategory, Cents>();
  for (const asset of assets) {
    const value = assetValue(asset, valuations, asOf);
    const previous = byCategory.get(asset.category) ?? ZERO_CENTS;
    byCategory.set(asset.category, sumCents([previous, value]));
  }
  return byCategory;
};
