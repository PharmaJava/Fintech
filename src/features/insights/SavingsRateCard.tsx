import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PiggyBank } from 'lucide-react';
import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/stores/financeStore';

import { savingsRateSeries } from './insights';

const MONTHS = 6;

/** Etiqueta corta del mes (p. ej. "jun"). */
const monthLabel = (month: string): string =>
  format(parseISO(`${month}-01`), 'LLL', { locale: es });

/**
 * Evolución de la tasa de ahorro de los últimos meses. Una tasa negativa
 * (gastaste más de lo que ingresaste) se muestra en rojo.
 */
export function SavingsRateCard() {
  const transactions = useFinanceStore((s) => s.transactions);

  const series = useMemo(
    () =>
      savingsRateSeries(transactions, format(new Date(), 'yyyy-MM'), MONTHS),
    [transactions],
  );

  const hasData = series.some((p) => p.income !== 0 || p.expense !== 0);

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <PiggyBank className="size-4" />
          {t('savings.title')}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{t('savings.window')}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {hasData ? (
          <ul className="space-y-2">
            {series.map((point) => {
              const rate = point.rate;
              const pct = rate === null ? 0 : Math.round(rate * 100);
              const width = Math.min(Math.abs(pct), 100);
              return (
                <li key={point.month} className="flex items-center gap-2">
                  <span className="w-8 shrink-0 text-xs capitalize text-muted-foreground">
                    {monthLabel(point.month)}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        rate !== null && rate < 0
                          ? 'bg-destructive'
                          : 'bg-primary',
                      )}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums">
                    {rate === null ? '—' : `${pct} %`}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-2 text-sm text-muted-foreground">
            {t('insights.empty')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
