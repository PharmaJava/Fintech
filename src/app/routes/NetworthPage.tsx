import { useEffect, useMemo } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { t } from '@/i18n';
import { AssetsCard } from '@/features/networth/AssetsCard';
import { LiabilitiesCard } from '@/features/networth/LiabilitiesCard';
import { NetWorthSummary } from '@/features/networth/NetWorthSummary';
import { WealthCurve } from '@/features/networth/WealthCurve';
import { currentNetWorth, netWorthSeries } from '@/features/networth/networth';
import { useNetworthStore } from '@/stores/networthStore';

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
      <WealthCurve series={series} />
      <AssetsCard />
      <LiabilitiesCard />
    </div>
  );
}
