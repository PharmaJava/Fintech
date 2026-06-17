import { History, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { t } from '@/i18n';
import { formatDate, formatEur } from '@/lib/format';
import { useNetworthStore } from '@/stores/networthStore';
import type { RefType } from '@/types/domain';

import { valuationsFor } from './networth';

interface Props {
  refType: RefType;
  refId: string;
  label: string;
}

/** Lista el historial de valoraciones de un activo/pasivo y permite borrarlas. */
export function ValuationHistoryDialog({ refType, refId, label }: Props) {
  const valuations = useNetworthStore((s) => s.valuations);
  const deleteValuation = useNetworthStore((s) => s.deleteValuation);
  const [open, setOpen] = useState(false);

  const history = useMemo(
    () =>
      valuationsFor(valuations, refType, refId).sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
    [valuations, refType, refId],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={`${t('networth.history')}: ${label}`}
        >
          <History className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('networth.history.title')}</DialogTitle>
        </DialogHeader>
        {history.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('networth.history.empty')}
          </p>
        ) : (
          <ul className="max-h-80 divide-y overflow-y-auto">
            {history.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between gap-2 py-2"
              >
                <span className="text-sm text-muted-foreground">
                  {formatDate(v.date)}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-medium tabular-nums">
                    {formatEur(v.value)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t('networth.delete')}
                    onClick={() => void deleteValuation(v.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
