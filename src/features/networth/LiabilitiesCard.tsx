import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { formatEur } from '@/lib/format';
import { useNetworthStore } from '@/stores/networthStore';

import { AddLiabilityDialog } from './AddLiabilityDialog';
import { AddValuationDialog } from './AddValuationDialog';
import { liabilityValue } from './networth';

/** Lista de pasivos con su importe actual, nueva valoracion y borrado. */
export function LiabilitiesCard() {
  const liabilities = useNetworthStore((s) => s.liabilities);
  const valuations = useNetworthStore((s) => s.valuations);
  const deleteLiability = useNetworthStore((s) => s.deleteLiability);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-4">
        <CardTitle className="text-base">
          {t('networth.liabilities.title')}
        </CardTitle>
        <AddLiabilityDialog />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {liabilities.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('networth.liabilities.empty')}
          </p>
        ) : (
          <ul className="divide-y">
            {liabilities.map((liability) => (
              <li
                key={liability.id}
                className="flex items-center justify-between gap-2 py-3"
              >
                <p className="min-w-0 truncate font-medium">{liability.name}</p>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="font-semibold tabular-nums text-destructive">
                    {formatEur(liabilityValue(liability, valuations))}
                  </span>
                  <AddValuationDialog
                    refType="liability"
                    refId={liability.id}
                    label={liability.name}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`${t('networth.delete')}: ${liability.name}`}
                    onClick={() => void deleteLiability(liability.id)}
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
