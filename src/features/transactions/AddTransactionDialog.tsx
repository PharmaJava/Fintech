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
import type { TransactionType } from '@/types/domain';

import { orderedCategories } from './categoryTree';
import { TRANSACTION_TYPES, transactionTypeLabel } from './labels';

/** Dialogo para registrar un movimiento (ingreso/gasto/transferencia). */
export function AddTransactionDialog() {
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);
  const addTransaction = useFinanceStore((s) => s.addTransaction);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const visibleCategories = useMemo(
    () =>
      orderedCategories(categories, type === 'income' ? 'income' : 'expense'),
    [categories, type],
  );

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    const value = Number(amount);
    const account = accountId || accounts[0]?.id;
    const category = categoryId || visibleCategories[0]?.category.id;
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
      await addTransaction({
        type,
        amount: value,
        accountId: account,
        categoryId: category,
        date,
        note,
      });
      setAmount('');
      setNote('');
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={accounts.length === 0}>
          <Plus />
          {t('transactions.add')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('transactions.add')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="txn-type">{t('common.type')}</Label>
            <Select
              id="txn-type"
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
            <Label htmlFor="txn-amount">{t('transactions.form.amount')}</Label>
            <Input
              id="txn-amount"
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
            <Label htmlFor="txn-account">
              {t('transactions.form.account')}
            </Label>
            <Select
              id="txn-account"
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
            <Label htmlFor="txn-category">
              {t('transactions.form.category')}
            </Label>
            <Select
              id="txn-category"
              value={categoryId || (visibleCategories[0]?.category.id ?? '')}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {visibleCategories.map((n) => (
                <option key={n.category.id} value={n.category.id}>
                  {n.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="txn-date">{t('transactions.form.date')}</Label>
            <Input
              id="txn-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="txn-note">{t('transactions.form.note')}</Label>
            <Input
              id="txn-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
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
