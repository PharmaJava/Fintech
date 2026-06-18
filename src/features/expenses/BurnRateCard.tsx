import { TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { formatEur } from '@/lib/format';

import type { BurnRate } from './expenses';

/** Proyección de gasto de fin de mes (burn rate) del mes en curso. */
export function BurnRateCard({ burnRate }: { burnRate: BurnRate }) {
  // En meses futuros (sin días transcurridos) no hay nada que proyectar.
  if (burnRate.daysElapsed === 0) return null;

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4" />
          {t('expenses.burn.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <p className="text-sm text-muted-foreground">
          {t('expenses.burn.lead')}{' '}
          <span className="font-semibold text-foreground">
            {formatEur(burnRate.projected)}
          </span>
          .
        </p>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <p className="text-xs text-muted-foreground">
              {t('expenses.burn.spent')}
            </p>
            <p className="font-semibold tabular-nums">
              {formatEur(burnRate.spent)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t('expenses.burn.daily')}
            </p>
            <p className="font-semibold tabular-nums">
              {formatEur(burnRate.dailyAverage)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t('expenses.burn.days')}
            </p>
            <p className="font-semibold tabular-nums">
              {burnRate.daysElapsed}/{burnRate.daysInMonth}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('expenses.burn.note')}
        </p>
      </CardContent>
    </Card>
  );
}
