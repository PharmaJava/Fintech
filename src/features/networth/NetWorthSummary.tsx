import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/i18n';
import { formatEur } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { NetWorthBreakdown } from './networth';

/** Resumen del patrimonio: neto destacado + activos y pasivos. */
export function NetWorthSummary({ value }: { value: NetWorthBreakdown }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Card className="col-span-2 sm:col-span-1">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{t('networth.total')}</p>
          <p
            className={cn(
              'mt-1 text-2xl font-bold tracking-tight',
              value.net < 0 ? 'text-destructive' : 'text-primary',
            )}
          >
            {formatEur(value.net)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {t('networth.assets')}
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatEur(value.assets)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {t('networth.liabilities')}
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatEur(value.liabilities)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
