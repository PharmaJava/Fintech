import { format, startOfWeek } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/i18n';
import { formatDate, formatEur } from '@/lib/format';
import { useFinanceStore } from '@/stores/financeStore';

import { BurnRateCard } from './BurnRateCard';
import { dayOf, monthBurnRate, totalExpense } from './expenses';
import { QuickExpenseEntry } from './QuickExpenseEntry';
import { SubscriptionsCard } from './SubscriptionsCard';

export function ExpensesPage() {
  const load = useFinanceStore((s) => s.load);
  const seed = useFinanceStore((s) => s.seedDefaultCategoriesIfEmpty);
  const materialize = useFinanceStore((s) => s.materializeDueRecurring);
  const categories = useFinanceStore((s) => s.categories);
  const transactions = useFinanceStore((s) => s.transactions);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);

  useEffect(() => {
    const init = async (): Promise<void> => {
      await load();
      await seed();
      await materialize();
    };
    void init();
  }, [load, seed, materialize]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const month = today.slice(0, 7);
  const weekStart = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    'yyyy-MM-dd',
  );

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string): string => map.get(id) ?? '—';
  }, [categories]);

  const burnRate = useMemo(
    () => monthBurnRate(transactions, month, today),
    [transactions, month, today],
  );

  const todayTotal = useMemo(
    () => totalExpense(transactions.filter((txn) => dayOf(txn.date) === today)),
    [transactions, today],
  );

  const weekExpenses = useMemo(
    () =>
      transactions
        .filter((txn) => txn.type === 'expense' && dayOf(txn.date) >= weekStart)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, weekStart],
  );
  const weekTotal = useMemo(() => totalExpense(weekExpenses), [weekExpenses]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('expenses.title')}
        description={t('expenses.subtitle')}
      />

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t('expenses.today')}
            </p>
            <p className="mt-1 font-semibold text-destructive">
              {formatEur(todayTotal)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t('expenses.week')}
            </p>
            <p className="mt-1 font-semibold text-destructive">
              {formatEur(weekTotal)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t('expenses.month')}
            </p>
            <p className="mt-1 font-semibold text-destructive">
              {formatEur(burnRate.spent)}
            </p>
          </CardContent>
        </Card>
      </div>

      <QuickExpenseEntry />

      <BurnRateCard burnRate={burnRate} />

      <Card>
        <CardContent className="p-4">
          <p className="mb-2 text-sm font-medium">{t('expenses.recent')}</p>
          {weekExpenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('expenses.empty')}
            </p>
          ) : (
            <ul className="divide-y">
              {weekExpenses.map((txn) => (
                <li
                  key={txn.id}
                  className="flex items-center justify-between gap-2 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {categoryName(txn.categoryId)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(txn.date)}
                      {txn.note ? ` · ${txn.note}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="font-semibold tabular-nums text-destructive">
                      -{formatEur(txn.amount)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={t('common.delete')}
                      onClick={() => void deleteTransaction(txn.id)}
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

      <SubscriptionsCard transactions={transactions} />
    </div>
  );
}
