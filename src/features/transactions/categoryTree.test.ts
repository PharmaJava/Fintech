import { describe, expect, it } from 'vitest';

import type { Category } from '@/types/domain';

import { orderedCategories } from './categoryTree';

const cat = (id: string, name: string, parentId?: string): Category => ({
  id,
  name,
  kind: 'expense',
  color: '#000',
  ...(parentId ? { parentId } : {}),
});

describe('features/transactions/categoryTree', () => {
  it('ordena padres y coloca las hijas debajo con etiqueta jerárquica', () => {
    const categories = [
      cat('viv', 'Vivienda'),
      cat('hip', 'Hipoteca', 'viv'),
      cat('luz', 'Luz', 'viv'),
      cat('ali', 'Alimentación'),
    ];
    const nodes = orderedCategories(categories, 'expense');
    expect(nodes.map((n) => n.label)).toEqual([
      'Alimentación',
      'Vivienda',
      'Vivienda › Hipoteca',
      'Vivienda › Luz',
    ]);
    expect(nodes.find((n) => n.category.id === 'hip')?.depth).toBe(1);
  });

  it('trata como raíz una categoría cuyo padre no existe o es de otro tipo', () => {
    const categories = [cat('x', 'Huérfana', 'no-existe')];
    const nodes = orderedCategories(categories, 'expense');
    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.depth).toBe(0);
  });
});
