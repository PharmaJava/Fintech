import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';
import type { CategoryKind } from '@/types/domain';

/** Gestion de categorias (alta/baja) para Ajustes. */
export function CategoriesManager() {
  const categories = useFinanceStore((s) => s.categories);
  const addCategory = useFinanceStore((s) => s.addCategory);
  const deleteCategory = useFinanceStore((s) => s.deleteCategory);

  const [name, setName] = useState('');
  const [kind, setKind] = useState<CategoryKind>('expense');
  const [color, setColor] = useState('#64748b');

  const add = async (): Promise<void> => {
    if (name.trim() === '') return;
    await addCategory(name.trim(), kind, color);
    setName('');
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">{t('categories.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('common.name')}
          />
          <Select
            value={kind}
            onChange={(e) => setKind(e.target.value as CategoryKind)}
            className="w-28"
          >
            <option value="expense">{t('categories.kind.expense')}</option>
            <option value="income">{t('categories.kind.income')}</option>
          </Select>
          <input
            type="color"
            aria-label="Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-10 shrink-0 rounded-md border border-input bg-background"
          />
          <Button
            size="icon"
            aria-label={t('categories.add')}
            onClick={() => void add()}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {categories.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            {t('categories.empty')}
          </p>
        ) : (
          <ul className="divide-y">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-2 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="truncate font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {category.kind === 'income'
                      ? t('categories.kind.income')
                      : t('categories.kind.expense')}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={t('common.delete')}
                  onClick={() => void deleteCategory(category.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
