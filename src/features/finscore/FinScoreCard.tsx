import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import {
  assetValue,
  currentNetWorth,
  LIQUID_CATEGORIES,
} from '@/features/networth/networth';
import {
  monthOf,
  monthSummary,
  monthsWithActivity,
} from '@/features/transactions/transactions';
import { fromCents } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/stores/financeStore';
import { useNetworthStore } from '@/stores/networthStore';
import { format } from 'date-fns';

import { finScore } from './finscore';

const RATING_KEY = {
  malo: 'finscore.rating.malo',
  regular: 'finscore.rating.regular',
  bueno: 'finscore.rating.bueno',
  excelente: 'finscore.rating.excelente',
} as const;

/** Tarjeta de FinScore: calcula la salud financiera a partir de los datos. */
export function FinScoreCard() {
  const assets = useNetworthStore((s) => s.assets);
  const liabilities = useNetworthStore((s) => s.liabilities);
  const valuations = useNetworthStore((s) => s.valuations);
  const transactions = useFinanceStore((s) => s.transactions);

  const { score, rating, savingsRate, emergencyMonths, debtToAssets } =
    useMemo(() => {
      const net = currentNetWorth(assets, liabilities, valuations);
      const assetsMajor = fromCents(net.assets);
      const liabilitiesMajor = fromCents(net.liabilities);

      const months = monthsWithActivity(transactions);
      const avgMonthlyExpense =
        months.length > 0
          ? months.reduce(
              (sum, m) =>
                sum + fromCents(monthSummary(transactions, m).expense),
              0,
            ) / months.length
          : 0;

      const thisMonth = monthSummary(
        transactions,
        monthOf(format(new Date(), 'yyyy-MM-dd')),
      );
      const incomeMajor = fromCents(thisMonth.income);
      const savings =
        incomeMajor > 0
          ? (incomeMajor - fromCents(thisMonth.expense)) / incomeMajor
          : 0;

      const liquidMajor = assets
        .filter((a) => LIQUID_CATEGORIES.has(a.category))
        .reduce((sum, a) => sum + fromCents(assetValue(a, valuations)), 0);
      const emergency =
        avgMonthlyExpense > 0
          ? liquidMajor / avgMonthlyExpense
          : liquidMajor > 0
            ? 6
            : 0;

      const debt = assetsMajor > 0 ? liabilitiesMajor / assetsMajor : 0;

      const result = finScore({
        savingsRate: savings,
        emergencyMonths: emergency,
        debtToAssets: debt,
        budgetAdherence: 1,
        netWorthPositive: net.net > 0,
      });

      return {
        ...result,
        savingsRate: savings,
        emergencyMonths: emergency,
        debtToAssets: debt,
      };
    }, [assets, liabilities, valuations, transactions]);

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">{t('finscore.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex size-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold',
              score >= 60
                ? 'bg-primary/10 text-primary'
                : score >= 40
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-destructive/10 text-destructive',
            )}
          >
            {score}
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{t(RATING_KEY[rating])}</p>
            <p className="text-muted-foreground">
              {t('finscore.savings')}: {Math.round(savingsRate * 100)}%
            </p>
            <p className="text-muted-foreground">
              {t('finscore.emergency')}: {emergencyMonths.toFixed(1)}
            </p>
            <p className="text-muted-foreground">
              {t('finscore.debt')}: {Math.round(debtToAssets * 100)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
