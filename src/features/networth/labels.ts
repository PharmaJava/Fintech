import { t } from '@/i18n';
import type { AssetCategory } from '@/types/domain';

const CATEGORY_KEYS = {
  cash: 'networth.category.cash',
  savings: 'networth.category.savings',
  index_funds: 'networth.category.index_funds',
  stocks: 'networth.category.stocks',
  pension: 'networth.category.pension',
  fixed_income: 'networth.category.fixed_income',
  crypto: 'networth.category.crypto',
  real_estate: 'networth.category.real_estate',
  vehicle: 'networth.category.vehicle',
  other: 'networth.category.other',
  // Legacy
  liquid: 'networth.category.cash',
  invested: 'networth.category.stocks',
} as const;

/** Etiqueta traducida de una categoria de activo. */
export const categoryLabel = (category: AssetCategory): string =>
  t(CATEGORY_KEYS[category]);
