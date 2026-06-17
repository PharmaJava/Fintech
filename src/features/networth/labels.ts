import { t } from '@/i18n';
import type { AssetCategory } from '@/types/domain';

const CATEGORY_KEYS = {
  liquid: 'networth.category.liquid',
  invested: 'networth.category.invested',
  real_estate: 'networth.category.real_estate',
  vehicle: 'networth.category.vehicle',
  other: 'networth.category.other',
} as const;

/** Etiqueta traducida de una categoria de activo. */
export const categoryLabel = (category: AssetCategory): string =>
  t(CATEGORY_KEYS[category]);
