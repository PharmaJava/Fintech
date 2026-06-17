import { useState, type FormEvent, type ReactNode } from 'react';

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
import { fromCents, type Cents } from '@/lib/money';
import { useFinanceStore } from '@/stores/financeStore';

interface Props {
  categoryId: string;
  categoryName: string;
  month: string;
  currentLimit?: Cents;
  trigger: ReactNode;
}

/** Dialogo para fijar/actualizar el limite de presupuesto de una categoria/mes. */
export function SetBudgetDialog({
  categoryId,
  categoryName,
  month,
  currentLimit,
  trigger,
}: Props) {
  const setBudget = useFinanceStore((s) => s.setBudget);
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(
    currentLimit !== undefined ? String(fromCents(currentLimit)) : '',
  );
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const value = Number(limit);
    if (!Number.isFinite(value) || value < 0) return;
    setBusy(true);
    try {
      await setBudget(categoryId, month, value);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setLimit(
            currentLimit !== undefined ? String(fromCents(currentLimit)) : '',
          );
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('budgets.set')}: {categoryName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="budget-limit">{t('budgets.limit')}</Label>
            <Input
              id="budget-limit"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={busy}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
