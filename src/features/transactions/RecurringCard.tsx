import { Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { formatDate, formatEur } from '@/lib/format';
import { useFinanceStore } from '@/stores/financeStore';

import { AddRecurringDialog } from './AddRecurringDialog';
import { frequencyLabel } from './labels';

/** Lista de reglas recurrentes con su proxima fecha y borrado. */
export function RecurringCard() {
  const rules = useFinanceStore((s) => s.recurringRules);
  const categories = useFinanceStore((s) => s.categories);
  const deleteRule = useFinanceStore((s) => s.deleteRecurringRule);

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string): string => map.get(id) ?? '—';
  }, [categories]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-4">
        <CardTitle className="text-base">
          {t('transactions.recurring.title')}
        </CardTitle>
        <AddRecurringDialog />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {rules.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('transactions.recurring.empty')}
          </p>
        ) : (
          <ul className="divide-y">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-center justify-between gap-2 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {categoryName(rule.templateTxn.categoryId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {frequencyLabel(rule.frequency)} ·{' '}
                    {t('transactions.recurring.next')}{' '}
                    {formatDate(rule.nextRun)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="font-semibold tabular-nums">
                    {formatEur(rule.templateTxn.amount)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t('common.delete')}
                    onClick={() => void deleteRule(rule.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
