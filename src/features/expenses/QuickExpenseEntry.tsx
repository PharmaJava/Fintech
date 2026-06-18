import { format } from 'date-fns';
import { Check, Plus } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { orderedCategories } from '@/features/transactions/categoryTree';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/stores/financeStore';

/**
 * Registro rápido de gasto del día, pensado para móvil: importe grande,
 * categoría de un toque y guardar. La fecha es hoy por defecto.
 */
export function QuickExpenseEntry() {
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);
  const addTransaction = useFinanceStore((s) => s.addTransaction);

  const expenseCategories = useMemo(
    () => orderedCategories(categories, 'expense'),
    [categories],
  );

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const selectedCategory =
    categoryId || expenseCategories[0]?.category.id || '';
  const selectedAccount = accountId || accounts[0]?.id || '';

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    if (!selectedAccount || !selectedCategory) return;
    setBusy(true);
    try {
      await addTransaction({
        type: 'expense',
        amount: value,
        accountId: selectedAccount,
        categoryId: selectedCategory,
        date: format(new Date(), 'yyyy-MM-dd'),
        note,
      });
      setAmount('');
      setNote('');
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1500);
    } finally {
      setBusy(false);
    }
  };

  if (accounts.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        {t('transactions.needAccount')}
      </p>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="quick-amount">{t('expenses.quick.amount')}</Label>
            <Input
              id="quick-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-14 text-center text-2xl font-semibold tabular-nums"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t('transactions.form.category')}</Label>
            <div className="flex flex-wrap gap-1.5">
              {expenseCategories.map((node) => {
                const active = node.category.id === selectedCategory;
                return (
                  <button
                    key={node.category.id}
                    type="button"
                    onClick={() => setCategoryId(node.category.id)}
                    className={cn(
                      'min-h-10 rounded-full border px-3 py-1.5 text-sm transition-colors',
                      active
                        ? 'border-primary bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {node.label}
                  </button>
                );
              })}
            </div>
          </div>

          {accounts.length > 1 && (
            <div className="space-y-1.5">
              <Label htmlFor="quick-account">
                {t('transactions.form.account')}
              </Label>
              <Select
                id="quick-account"
                value={selectedAccount}
                onChange={(e) => setAccountId(e.target.value)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="quick-note">{t('transactions.form.note')}</Label>
            <Input
              id="quick-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button type="submit" className="h-11 w-full" disabled={busy}>
            {justAdded ? (
              <>
                <Check className="size-4" />
                {t('expenses.quick.added')}
              </>
            ) : (
              <>
                <Plus className="size-4" />
                {t('expenses.quick.add')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
