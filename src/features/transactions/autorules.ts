/**
 * features/transactions/autorules — auto-categorizacion por palabra clave (puro).
 */
import type { AutoRule } from '@/types/domain';

/** Devuelve el categoryId de la primera regla cuya keyword aparezca en la nota. */
export const matchCategory = (
  note: string,
  rules: readonly AutoRule[],
): string | undefined => {
  const haystack = note.toLowerCase();
  for (const rule of rules) {
    const keyword = rule.keyword.trim().toLowerCase();
    if (keyword.length > 0 && haystack.includes(keyword)) {
      return rule.categoryId;
    }
  }
  return undefined;
};
