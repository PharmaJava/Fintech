import { Download, Upload } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';

import { parseTransactionsCsv, toCsv, type CsvExportRow } from './csv';

/** Exportacion e importacion de movimientos en CSV (una direccion cada una). */
export function CsvTools() {
  const transactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);
  const importTransactions = useFinanceStore((s) => s.importTransactions);

  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<string | null>(null);

  const exportCsv = (): void => {
    const accountName = new Map(accounts.map((a) => [a.id, a.name]));
    const categoryName = new Map(categories.map((c) => [c.id, c.name]));
    const rows: CsvExportRow[] = transactions
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((txn) => ({
        date: txn.date,
        type: txn.type,
        amountCents: txn.amount,
        account: accountName.get(txn.accountId) ?? '',
        category: categoryName.get(txn.categoryId) ?? '',
        note: txn.note,
        tags: txn.tags,
      }));

    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `patrimonio-movimientos-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseTransactionsCsv(text);
    const created = await importTransactions(parsed.rows);
    setResult(
      `${created} ${t('csv.imported')}` +
        (parsed.errors.length > 0
          ? ` · ${parsed.errors.length} ${t('csv.errors')}`
          : ''),
    );
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">{t('csv.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-4" />
            {t('csv.export')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-4" />
            {t('csv.import')}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => void onFile(e)}
          />
        </div>
        {result !== null && <p className="text-sm text-primary">{result}</p>}
        <p className="text-xs text-muted-foreground">{t('csv.help')}</p>
      </CardContent>
    </Card>
  );
}
