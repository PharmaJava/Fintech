import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { formatDate, formatEur } from '@/lib/format';
import { cents, fromCents } from '@/lib/money';
import type { NetWorthPoint } from './networth';

/** Curva de evolucion del patrimonio neto. Mobile-first (alto compacto). */
export function WealthCurve({ series }: { series: NetWorthPoint[] }) {
  const data = series.map((point) => ({
    date: point.date,
    net: fromCents(point.net),
  }));

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base">{t('networth.curve.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('networth.curve.empty')}
          </p>
        ) : (
          <div className="h-48 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11 }}
                  minTickGap={24}
                />
                <YAxis
                  width={48}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) =>
                    new Intl.NumberFormat('es-ES', {
                      notation: 'compact',
                    }).format(v)
                  }
                />
                <Tooltip
                  labelFormatter={(label) => formatDate(String(label))}
                  formatter={(value) => [
                    formatEur(cents(Math.round(Number(value) * 100))),
                    t('networth.total'),
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#netFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
