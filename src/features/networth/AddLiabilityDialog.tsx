import { Plus } from 'lucide-react';
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
import { liabilityFormSchema } from '@/lib/validation/networth';
import { useNetworthStore } from '@/stores/networthStore';

/** Dialogo para anadir un pasivo (deuda). */
export function AddLiabilityDialog() {
  const addLiability = useNetworthStore((s) => s.addLiability);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interest, setInterest] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = (): void => {
    setName('');
    setPrincipal('');
    setInterest('');
    setError(null);
  };

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const parsed = liabilityFormSchema.safeParse({
      name,
      principal: Number(principal),
      ...(interest.trim() !== ''
        ? { interestRatePercent: Number(interest) }
        : {}),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Datos invalidos');
      return;
    }
    setBusy(true);
    try {
      const { interestRatePercent } = parsed.data;
      await addLiability({
        name: parsed.data.name,
        principal: parsed.data.principal,
        ...(interestRatePercent !== undefined ? { interestRatePercent } : {}),
      });
      reset();
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
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus />
          {t('networth.addLiability')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('networth.addLiability')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="liab-name">{t('networth.form.name')}</Label>
            <Input
              id="liab-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="liab-principal">
              {t('networth.form.principal')}
            </Label>
            <Input
              id="liab-principal"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="liab-interest">{t('networth.form.interest')}</Label>
            <Input
              id="liab-interest"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
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
