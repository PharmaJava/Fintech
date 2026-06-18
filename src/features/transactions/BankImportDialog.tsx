import { Landmark } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';

import { parseBankCsv } from './bankCsv';

/** Diálogo para autocargar un extracto bancario (CSV) en una cuenta. */
export function BankImportDialog() {
  const accounts = useFinanceStore((s) => s.accounts);
  const importBankCsv = useFinanceStore((s) => s.importBankCsv);

  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    const account = accountId || accounts[0]?.id;
    if (!file || !account) return;
    setBusy(true);
    setResult(null);
    try {
      const text = await file.text();
      const parsed = parseBankCsv(text);
      const created = await importBankCsv(account, parsed.rows);
      setResult(
        `${created} ${t('bank.result')}` +
          (parsed.errors.length > 0
            ? ` · ${parsed.errors.length} ${t('bank.errors')}`
            : ''),
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={accounts.length === 0}>
          <Landmark className="size-4" />
          {t('bank.import')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('bank.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('bank.noAccount')}
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="bank-account">{t('bank.account')}</Label>
                <Select
                  id="bank-account"
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
                <Label htmlFor="bank-file">{t('bank.file')}</Label>
                <input
                  ref={fileRef}
                  id="bank-file"
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  disabled={busy}
                  onChange={(e) => void onFile(e)}
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                />
              </div>
              {result !== null && (
                <p className="text-sm text-primary">{result}</p>
              )}
              <p className="text-xs text-muted-foreground">{t('bank.help')}</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
