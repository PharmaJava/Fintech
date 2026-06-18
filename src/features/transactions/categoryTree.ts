/**
 * features/transactions/categoryTree — orden jerárquico de categorías (puro).
 *
 * Las categorías pueden tener `parentId` (sub-categorías). Esta utilidad
 * devuelve una lista plana ordenada (padre y luego sus hijas) con la etiqueta
 * y profundidad, para usar en selects y listados.
 */
import type { Category, CategoryKind } from '@/types/domain';

export interface CategoryNode {
  category: Category;
  depth: number;
  /** Etiqueta jerárquica, p.ej. "Vivienda › Hipoteca". */
  label: string;
}

/** Devuelve las categorías de un tipo ordenadas: cada padre seguido de sus hijas. */
export const orderedCategories = (
  categories: readonly Category[],
  kind: CategoryKind,
): CategoryNode[] => {
  const ofKind = categories.filter((c) => c.kind === kind);
  const ids = new Set(ofKind.map((c) => c.id));
  const isRoot = (c: Category): boolean =>
    c.parentId === undefined || !ids.has(c.parentId);

  const roots = ofKind
    .filter(isRoot)
    .sort((a, b) => a.name.localeCompare(b.name));

  const result: CategoryNode[] = [];
  for (const root of roots) {
    result.push({ category: root, depth: 0, label: root.name });
    const children = ofKind
      .filter((c) => c.parentId === root.id && c.id !== root.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const child of children) {
      result.push({
        category: child,
        depth: 1,
        label: `${root.name} › ${child.name}`,
      });
    }
  }
  return result;
};
