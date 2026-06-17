import { Plus, Trash2, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';

/** Gestion de reglas de auto-categorizacion para Ajustes. */
export function RulesManager() {
  const rules = useFinanceStore((s) => s.autoRules);
  const categories = useFinanceStore((s) => s.categories);
  const addAutoRule = useFinanceStore((s) => s.addAutoRule);
  const deleteAutoRule = useFinanceStore((s) => s.deleteAutoRule);
  const applyToExisting = useFinanceStore((s) => s.applyAutoRulesToExisting);

  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [applied, setApplied] = useState<number | null>(null);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.kind === 'expense'),
    [categories],
  );
  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string): string => map.get(id) ?? '—';
  }, [categories]);

  const add = async (): Promise<void> => {
    const cat = categoryId || expenseCategories[0]?.id;
    if (keyword.trim() === '' || !cat) return;
    await addAutoRule(keyword.trim(), cat);
    setKeyword('');
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wand2 className="size-4" />
          {t('rules.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <p className="text-xs text-muted-foreground">{t('rules.subtitle')}</p>
        <div className="flex flex-wrap gap-2">
          <Input
            className="min-w-32 flex-1"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t('rules.keyword')}
          />
          <Select
            className="w-36"
            value={categoryId || (expenseCategories[0]?.id ?? '')}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button
            size="icon"
            aria-label={t('rules.add')}
            onClick={() => void add()}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {rules.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            {t('rules.empty')}
          </p>
        ) : (
          <ul className="divide-y">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-center justify-between gap-2 py-2"
              >
                <span className="min-w-0 truncate text-sm">
                  «{rule.keyword}» → {categoryName(rule.categoryId)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={t('common.delete')}
                  onClick={() => void deleteAutoRule(rule.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {rules.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => setApplied(await applyToExisting())}
            >
              {t('rules.apply')}
            </Button>
            {applied !== null && (
              <span className="text-sm text-primary">
                {applied} {t('rules.applied')}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
