import { Pencil } from 'lucide-react';
import { useState, type FormEvent } from 'react';

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
import { useNetworthStore } from '@/stores/networthStore';
import type { Liability } from '@/types/domain';

/** Dialogo para editar nombre e interes de un pasivo. */
export function EditLiabilityDialog({ liability }: { liability: Liability }) {
  const updateLiability = useNetworthStore((s) => s.updateLiability);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(liability.name);
  const [interest, setInterest] = useState(
    liability.interestRate !== undefined
      ? String(liability.interestRate * 100)
      : '',
  );
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (name.trim() === '') return;
    setBusy(true);
    try {
      await updateLiability(liability.id, {
        name: name.trim(),
        ...(interest.trim() !== ''
          ? { interestRatePercent: Number(interest) }
          : {}),
      });
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
          setName(liability.name);
          setInterest(
            liability.interestRate !== undefined
              ? String(liability.interestRate * 100)
              : '',
          );
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={`${t('networth.edit')}: ${liability.name}`}
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('networth.editLiability')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-liab-name">{t('networth.form.name')}</Label>
            <Input
              id="edit-liab-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-liab-interest">
              {t('networth.form.interest')}
            </Label>
            <Input
              id="edit-liab-interest"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
            />
          </div>
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
