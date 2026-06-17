import { lazy, Suspense, useEffect, useMemo } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { AssetsCard } from '@/features/networth/AssetsCard';
import { LiabilitiesCard } from '@/features/networth/LiabilitiesCard';
import { NetWorthSummary } from '@/features/networth/NetWorthSummary';
import { currentNetWorth, netWorthSeries } from '@/features/networth/networth';
import { t } from '@/i18n';
import { useNetworthStore } from '@/stores/networthStore';

// Charts (Recharts) en chunks aparte para aligerar la carga inicial.
const WealthCurve = lazy(() =>
  import('@/features/networth/WealthCurve').then((m) => ({
    default: m.WealthCurve,
  })),
);
const CategoryBreakdown = lazy(() =>
  import('@/features/networth/CategoryBreakdown').then((m) => ({
    default: m.CategoryBreakdown,
  })),
);

function ChartFallback() {
  return (
    <Card>
      <CardContent className="h-48 animate-pulse rounded-lg bg-muted/40" />
    </Card>
  );
}

export function NetworthPage() {
  const load = useNetworthStore((s) => s.load);
  const assets = useNetworthStore((s) => s.assets);
  const liabilities = useNetworthStore((s) => s.liabilities);
  const valuations = useNetworthStore((s) => s.valuations);

  useEffect(() => {
    void load();
  }, [load]);

  const breakdown = useMemo(
    () => currentNetWorth(assets, liabilities, valuations),
    [assets, liabilities, valuations],
  );
  const series = useMemo(
    () => netWorthSeries(assets, liabilities, valuations),
    [assets, liabilities, valuations],
  );

  return (
    <div className="space-y-4">
      <PageHeader title={t('networth.title')} />
      <NetWorthSummary value={breakdown} />
      <Suspense fallback={<ChartFallback />}>
        <WealthCurve series={series} />
      </Suspense>
      <Suspense fallback={<ChartFallback />}>
        <CategoryBreakdown assets={assets} valuations={valuations} />
      </Suspense>
      <AssetsCard />
      <LiabilitiesCard />
    </div>
  );
}
