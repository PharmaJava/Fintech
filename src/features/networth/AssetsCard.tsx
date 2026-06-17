import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { formatEur } from '@/lib/format';
import { useNetworthStore } from '@/stores/networthStore';

import { AddAssetDialog } from './AddAssetDialog';
import { AddValuationDialog } from './AddValuationDialog';
import { assetValue } from './networth';
import { categoryLabel } from './labels';

/** Lista de activos con su valor actual, nueva valoracion y borrado. */
export function AssetsCard() {
  const assets = useNetworthStore((s) => s.assets);
  const valuations = useNetworthStore((s) => s.valuations);
  const deleteAsset = useNetworthStore((s) => s.deleteAsset);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-4">
        <CardTitle className="text-base">
          {t('networth.assets.title')}
        </CardTitle>
        <AddAssetDialog />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {assets.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('networth.assets.empty')}
          </p>
        ) : (
          <ul className="divide-y">
            {assets.map((asset) => (
              <li
                key={asset.id}
                className="flex items-center justify-between gap-2 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabel(asset.category)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="font-semibold tabular-nums">
                    {formatEur(assetValue(asset, valuations))}
                  </span>
                  <AddValuationDialog
                    refType="asset"
                    refId={asset.id}
                    label={asset.name}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`${t('networth.delete')}: ${asset.name}`}
                    onClick={() => void deleteAsset(asset.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
