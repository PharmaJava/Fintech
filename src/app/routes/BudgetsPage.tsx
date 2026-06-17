import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { MonthPicker } from '@/components/shared/MonthPicker';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SetBudgetDialog } from '@/features/budgets/SetBudgetDialog';
import { spendingByCategory } from '@/features/transactions/transactions';
import { t } from '@/i18n';
import { formatEur } from '@/lib/format';
import { subtractCents, ZERO_CENTS } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/stores/financeStore';

export function BudgetsPage() {
  const load = useFinanceStore((s) => s.load);
  const categories = useFinanceStore((s) => s.categories);
  const budgets = useFinanceStore((s) => s.budgets);
  const transactions = useFinanceStore((s) => s.transactions);

  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    void load();
  }, [load]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.kind === 'expense'),
    [categories],
  );
  const spending = useMemo(
    () => spendingByCategory(transactions, month),
    [transactions, month],
  );
  const budgetByCategory = useMemo(() => {
    const map = new Map(
      budgets.filter((b) => b.month === month).map((b) => [b.categoryId, b]),
    );
    return map;
  }, [budgets, month]);

  return (
    <div className="space-y-4">
      <PageHeader title={t('budgets.title')} />
      <MonthPicker month={month} onChange={setMonth} />

      {expenseCategories.length === 0 ? (
        <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          {t('budgets.empty')}
        </p>
      ) : (
        <div className="space-y-3">
          {expenseCategories.map((category) => {
            const budget = budgetByCategory.get(category.id);
            const spent = spending.get(category.id) ?? ZERO_CENTS;
            const limit = budget?.limit ?? ZERO_CENTS;
            const ratio = limit > 0 ? spent / limit : 0;
            const over = limit > 0 && spent > limit;
            const remaining = subtractCents(limit, spent);

            return (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="truncate font-medium">
                        {category.name}
                      </span>
                    </div>
                    <SetBudgetDialog
                      categoryId={category.id}
                      categoryName={category.name}
                      month={month}
                      {...(budget ? { currentLimit: budget.limit } : {})}
                      trigger={
                        <Button size="sm" variant="ghost">
                          <Pencil className="size-3.5" />
                          {budget ? t('budgets.limit') : t('budgets.set')}
                        </Button>
                      }
                    />
                  </div>

                  {limit > 0 && (
                    <>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            over ? 'bg-destructive' : 'bg-primary',
                          )}
                          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {t('budgets.spent')} {formatEur(spent)}{' '}
                          {t('budgets.of')} {formatEur(limit)}
                        </span>
                        <span
                          className={
                            over ? 'text-destructive' : 'text-muted-foreground'
                          }
                        >
                          {over
                            ? t('budgets.over')
                            : `${t('budgets.remaining')} ${formatEur(remaining)}`}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
