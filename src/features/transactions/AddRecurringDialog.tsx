import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

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
import { Select } from '@/components/ui/select';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';
import type { RecurringFrequency, TransactionType } from '@/types/domain';

import {
  FREQUENCIES,
  TRANSACTION_TYPES,
  frequencyLabel,
  transactionTypeLabel,
} from './labels';

/** Dialogo para crear una regla de movimiento recurrente. */
export function AddRecurringDialog() {
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);
  const addRecurringRule = useFinanceStore((s) => s.addRecurringRule);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [nextRun, setNextRun] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const visibleCategories = useMemo(
    () =>
      categories.filter((c) =>
        type === 'income' ? c.kind === 'income' : c.kind === 'expense',
      ),
    [categories, type],
  );

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    const value = Number(amount);
    const account = accountId || accounts[0]?.id;
    const category = categoryId || visibleCategories[0]?.id;
    if (!Number.isFinite(value) || value <= 0) {
      setError('Introduce un importe valido');
      return;
    }
    if (!account || !category) {
      setError('Selecciona cuenta y categoria');
      return;
    }
    setBusy(true);
    try {
      await addRecurringRule({
        type,
        amount: value,
        accountId: account,
        categoryId: category,
        frequency,
        nextRun,
      });
      setAmount('');
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={accounts.length === 0}>
          <Plus />
          {t('transactions.recurring.add')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('transactions.recurring.add')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="rec-type">{t('common.type')}</Label>
            <Select
              id="rec-type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as TransactionType);
                setCategoryId('');
              }}
            >
              {TRANSACTION_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {transactionTypeLabel(tp)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rec-amount">{t('transactions.form.amount')}</Label>
            <Input
              id="rec-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rec-account">
              {t('transactions.form.account')}
            </Label>
            <Select
              id="rec-account"
              value={accountId || (accounts[0]?.id ?? '')}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rec-category">
              {t('transactions.form.category')}
            </Label>
            <Select
              id="rec-category"
              value={categoryId || (visibleCategories[0]?.id ?? '')}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {visibleCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rec-freq">
                {t('transactions.recurring.frequency')}
              </Label>
              <Select
                id="rec-freq"
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as RecurringFrequency)
                }
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {frequencyLabel(f)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rec-next">
                {t('transactions.recurring.next')}
              </Label>
              <Input
                id="rec-next"
                type="date"
                value={nextRun}
                onChange={(e) => setNextRun(e.target.value)}
              />
            </div>
          </div>
          {error !== null && (
            <p className="text-sm text-destructive">{error}</p>
          )}
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
