import { TrendingUp } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/i18n';
import { valuationFormSchema } from '@/lib/validation/networth';
import { useNetworthStore } from '@/stores/networthStore';
import type { RefType } from '@/types/domain';

interface Props {
  refType: RefType;
  refId: string;
  label: string;
}

/** Dialogo para registrar una valoracion fechada de un activo/pasivo. */
export function AddValuationDialog({ refType, refId, label }: Props) {
  const addValuation = useNetworthStore((s) => s.addValuation);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const parsed = valuationFormSchema.safeParse({
      value: Number(value),
      date,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Datos invalidos');
      return;
    }
    setBusy(true);
    try {
      await addValuation(refType, refId, parsed.data.value, parsed.data.date);
      setValue('');
      setError(null);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={`${t('networth.addValuation')}: ${label}`}
        >
          <TrendingUp className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('networth.addValuation')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="val-value">{t('networth.form.value')}</Label>
            <Input
              id="val-value"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="val-date">{t('networth.form.date')}</Label>
            <Input
              id="val-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {error !== null && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t('networth.form.cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={busy}>
              {t('networth.form.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
