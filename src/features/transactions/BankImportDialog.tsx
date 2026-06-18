import { Landmark } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';

import {
  buildBankRows,
  parseBankTable,
  type BankMapping,
  type BankTable,
} from './bankCsv';

type MapField = keyof BankMapping;

const MAP_FIELDS: { field: MapField; labelKey: Parameters<typeof t>[0] }[] = [
  { field: 'date', labelKey: 'bank.map.date' },
  { field: 'concept', labelKey: 'bank.map.concept' },
  { field: 'amount', labelKey: 'bank.map.amount' },
  { field: 'credit', labelKey: 'bank.map.credit' },
  { field: 'debit', labelKey: 'bank.map.debit' },
];

/** Diálogo para autocargar un extracto bancario con asistente de mapeo. */
export function BankImportDialog() {
  const accounts = useFinanceStore((s) => s.accounts);
  const importBankCsv = useFinanceStore((s) => s.importBankCsv);

  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [table, setTable] = useState<BankTable | null>(null);
  const [mapping, setMapping] = useState<BankMapping | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = (): void => {
    setTable(null);
    setMapping(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onFile = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseBankTable(text);
    setTable(parsed);
    setMapping(parsed.mapping);
    setResult(null);
  };

  const runImport = async (): Promise<void> => {
    const account = accountId || accounts[0]?.id;
    if (!table || !mapping || !account) return;
    setBusy(true);
    try {
      const built = buildBankRows(table, mapping);
      const created = await importBankCsv(account, built.rows);
      setResult(
        `${created} ${t('bank.result')}` +
          (built.errors.length > 0
            ? ` · ${built.errors.length} ${t('bank.errors')}`
            : ''),
      );
      setTable(null);
      setMapping(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <Button
        size="sm"
        variant="outline"
        disabled={accounts.length === 0}
        onClick={() => setOpen(true)}
      >
        <Landmark className="size-4" />
        {t('bank.import')}
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {table ? t('bank.map.title') : t('bank.title')}
          </DialogTitle>
        </DialogHeader>

        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('bank.noAccount')}</p>
        ) : !table ? (
          <div className="space-y-3">
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
                onChange={(e) => void onFile(e)}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
              />
            </div>
            {result !== null && (
              <p className="text-sm text-primary">{result}</p>
            )}
            <p className="text-xs text-muted-foreground">{t('bank.help')}</p>
          </div>
        ) : (
          mapping && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {table.rows.length} {t('bank.rowsDetected')}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {MAP_FIELDS.map(({ field, labelKey }) => (
                  <div key={field} className="space-y-1">
                    <Label className="text-xs">{t(labelKey)}</Label>
                    <Select
                      value={String(mapping[field])}
                      onChange={(e) =>
                        setMapping({
                          ...mapping,
                          [field]: Number(e.target.value),
                        })
                      }
                    >
                      <option value="-1">{t('bank.map.none')}</option>
                      {table.headers.map((h, i) => (
                        <option key={i} value={i}>
                          {h || `col ${i + 1}`}
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-xs">
                  <tbody>
                    {table.rows.slice(0, 3).map((row, r) => (
                      <tr key={r} className="border-b last:border-0">
                        {row.map((cell, c) => (
                          <td
                            key={c}
                            className="max-w-28 truncate px-2 py-1 text-muted-foreground"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap justify-between gap-2">
                <Button variant="outline" size="sm" onClick={reset}>
                  {t('bank.changeFile')}
                </Button>
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => void runImport()}
                >
                  {t('bank.confirm')}
                </Button>
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
