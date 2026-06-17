import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { MonthPicker } from '@/components/shared/MonthPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AddTransactionDialog } from '@/features/transactions/AddTransactionDialog';
import { RecurringCard } from '@/features/transactions/RecurringCard';
import { inMonth, monthSummary } from '@/features/transactions/transactions';
import { t } from '@/i18n';
import { formatDate, formatEur } from '@/lib/format';
import { useFinanceStore } from '@/stores/financeStore';

export function TransactionsPage() {
  const load = useFinanceStore((s) => s.load);
  const seed = useFinanceStore((s) => s.seedDefaultCategoriesIfEmpty);
  const materialize = useFinanceStore((s) => s.materializeDueRecurring);
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);
  const transactions = useFinanceStore((s) => s.transactions);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);

  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    const init = async (): Promise<void> => {
      await load();
      await seed();
      await materialize();
    };
    void init();
  }, [load, seed, materialize]);

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string): string => map.get(id) ?? '—';
  }, [categories]);

  const summary = useMemo(
    () => monthSummary(transactions, month),
    [transactions, month],
  );

  const monthTxns = useMemo(
    () =>
      transactions
        .filter((txn) => inMonth(txn, month))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, month],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <PageHeader title={t('transactions.title')} />
        <AddTransactionDialog />
      </div>

      <MonthPicker month={month} onChange={setMonth} />

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t('transactions.income')}
            </p>
            <p className="mt-1 font-semibold text-primary">
              {formatEur(summary.income)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t('transactions.expense')}
            </p>
            <p className="mt-1 font-semibold text-destructive">
              {formatEur(summary.expense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t('transactions.net')}
            </p>
            <p className="mt-1 font-semibold">{formatEur(summary.net)}</p>
          </CardContent>
        </Card>
      </div>

      {accounts.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          {t('transactions.needAccount')}
        </p>
      )}

      <Card>
        <CardContent className="p-4">
          {monthTxns.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('transactions.empty')}
            </p>
          ) : (
            <ul className="divide-y">
              {monthTxns.map((txn) => (
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
                    <span
                      className={
                        txn.type === 'income'
                          ? 'font-semibold tabular-nums text-primary'
                          : 'font-semibold tabular-nums text-destructive'
                      }
                    >
                      {txn.type === 'income' ? '+' : '-'}
                      {formatEur(txn.amount)}
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

      <RecurringCard />
    </div>
  );
}
