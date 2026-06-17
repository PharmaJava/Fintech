import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { formatEur } from '@/lib/format';
import { cents, fromCents } from '@/lib/money';
import type { Asset, AssetCategory, Valuation } from '@/types/domain';

import { assetsByCategory } from './networth';
import { categoryLabel } from './labels';

const COLORS: Record<AssetCategory, string> = {
  liquid: '#10b981',
  invested: '#3b82f6',
  real_estate: '#f59e0b',
  vehicle: '#8b5cf6',
  other: '#64748b',
};

/** Donut con el reparto del valor de los activos por categoria. */
export function CategoryBreakdown({
  assets,
  valuations,
}: {
  assets: Asset[];
  valuations: Valuation[];
}) {
  const byCategory = assetsByCategory(assets, valuations);
  const data = [...byCategory.entries()]
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      category,
      label: categoryLabel(category),
      value: fromCents(value),
      color: COLORS[category],
    }));

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base">
          {t('networth.breakdown.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('networth.breakdown.empty')}
          </p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    formatEur(cents(Math.round(Number(value) * 100))),
                    '',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
