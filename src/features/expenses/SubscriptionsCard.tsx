import { Repeat } from 'lucide-react';
import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { formatEur } from '@/lib/format';
import type { Transaction } from '@/types/domain';

import { detectSubscriptions, monthlySubscriptionsTotal } from './expenses';

/** Suscripciones / gastos fijos detectados a partir de los movimientos. */
export function SubscriptionsCard({
  transactions,
}: {
  transactions: readonly Transaction[];
}) {
  const subscriptions = useMemo(
    () => detectSubscriptions(transactions),
    [transactions],
  );
  const total = useMemo(
    () => monthlySubscriptionsTotal(subscriptions),
    [subscriptions],
  );

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Repeat className="size-4" />
          {t('expenses.subs.title')}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t('expenses.subs.lead')}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {subscriptions.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            {t('expenses.subs.empty')}
          </p>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between gap-2 border-b pb-2">
              <span className="text-sm text-muted-foreground">
                {t('expenses.subs.total')}
              </span>
              <span className="font-semibold tabular-nums">
                {formatEur(total)}
              </span>
            </div>
            <ul className="divide-y">
              {subscriptions.map((sub) => (
                <li
                  key={sub.key}
                  className="flex items-center justify-between gap-2 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{sub.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {sub.occurrences} {t('expenses.subs.charges')}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatEur(sub.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
