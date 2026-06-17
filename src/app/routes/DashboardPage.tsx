import { format } from 'date-fns';
import { useEffect, useMemo } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { GoalsCard } from '@/features/goals/GoalsCard';
import { NetWorthSummary } from '@/features/networth/NetWorthSummary';
import { currentNetWorth } from '@/features/networth/networth';
import { monthSummary } from '@/features/transactions/transactions';
import { t } from '@/i18n';
import { formatEur } from '@/lib/format';
import { useFinanceStore } from '@/stores/financeStore';
import { useNetworthStore } from '@/stores/networthStore';

export function DashboardPage() {
  const loadNetworth = useNetworthStore((s) => s.load);
  const assets = useNetworthStore((s) => s.assets);
  const liabilities = useNetworthStore((s) => s.liabilities);
  const valuations = useNetworthStore((s) => s.valuations);

  const loadFinance = useFinanceStore((s) => s.load);
  const transactions = useFinanceStore((s) => s.transactions);

  useEffect(() => {
    void loadNetworth();
    void loadFinance();
  }, [loadNetworth, loadFinance]);

  const breakdown = useMemo(
    () => currentNetWorth(assets, liabilities, valuations),
    [assets, liabilities, valuations],
  );
  const month = format(new Date(), 'yyyy-MM');
  const summary = useMemo(
    () => monthSummary(transactions, month),
    [transactions, month],
  );

  return (
    <div className="space-y-4">
      <PageHeader title={t('dashboard.title')} description={t('app.tagline')} />
      <NetWorthSummary value={breakdown} />
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
      <GoalsCard />
    </div>
  );
}
