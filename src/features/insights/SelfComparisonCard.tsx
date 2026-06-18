import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { formatEur } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Cents } from '@/lib/money';
import { useFinanceStore } from '@/stores/financeStore';
import { useNetworthStore } from '@/stores/networthStore';

import { compareToSelf } from './insights';

/** Importe con signo explícito (formatEur ya antepone "-" a los negativos). */
const signedEur = (value: Cents): string =>
  (value > 0 ? '+' : '') + formatEur(value);

/** Porcentaje con signo (p. ej. "+12,5 %"). */
const signedPct = (ratio: number): string =>
  `${ratio >= 0 ? '+' : ''}${(ratio * 100).toFixed(1)} %`;

/** Tasa de ahorro como porcentaje, o "—" si no hay ingresos. */
const ratePct = (rate: number | null): string =>
  rate === null ? '—' : `${(rate * 100).toFixed(0)} %`;

interface RowProps {
  label: string;
  value: string;
  delta: string;
  good: boolean;
}

function Row({ label, value, delta, good }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="font-medium tabular-nums">{value}</span>
        <span
          className={cn(
            'text-xs font-semibold tabular-nums',
            good ? 'text-primary' : 'text-destructive',
          )}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}

/**
 * Comparativa contra "ti mismo" hace 12 meses: patrimonio, gasto y tasa de
 * ahorro. No compara contra otros usuarios (privacidad), solo tu propio pasado.
 */
export function SelfComparisonCard() {
  const assets = useNetworthStore((s) => s.assets);
  const liabilities = useNetworthStore((s) => s.liabilities);
  const valuations = useNetworthStore((s) => s.valuations);
  const transactions = useFinanceStore((s) => s.transactions);

  const month = format(new Date(), 'yyyy-MM');
  const cmp = useMemo(
    () =>
      compareToSelf(month, 12, {
        assets,
        liabilities,
        valuations,
        transactions,
      }),
    [month, assets, liabilities, valuations, transactions],
  );

  const hasData =
    cmp.current.net !== 0 ||
    cmp.previous.net !== 0 ||
    cmp.current.income !== 0 ||
    cmp.current.expense !== 0 ||
    cmp.previous.income !== 0 ||
    cmp.previous.expense !== 0;

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4" />
          {t('insights.compare.title')}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t('insights.compare.window')}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {hasData ? (
          <div className="divide-y">
            <Row
              label={t('insights.netWorth')}
              value={formatEur(cmp.current.net)}
              delta={
                signedEur(cmp.netDelta) +
                (cmp.netDeltaRatio !== null
                  ? ` (${signedPct(cmp.netDeltaRatio)})`
                  : '')
              }
              good={cmp.netDelta >= 0}
            />
            <Row
              label={t('insights.expense')}
              value={formatEur(cmp.current.expense)}
              delta={
                signedEur(cmp.expenseDelta) +
                (cmp.expenseDeltaRatio !== null
                  ? ` (${signedPct(cmp.expenseDeltaRatio)})`
                  : '')
              }
              // En gasto, bajar es bueno.
              good={cmp.expenseDelta <= 0}
            />
            <Row
              label={t('insights.savingsRate')}
              value={ratePct(cmp.savingsRateCurrent)}
              delta={
                cmp.savingsRatePointsDelta !== null
                  ? `${cmp.savingsRatePointsDelta >= 0 ? '+' : ''}${(
                      cmp.savingsRatePointsDelta * 100
                    ).toFixed(1)} ${t('insights.points')}`
                  : '—'
              }
              good={(cmp.savingsRatePointsDelta ?? 0) >= 0}
            />
          </div>
        ) : (
          <p className="py-2 text-sm text-muted-foreground">
            {t('insights.empty')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
