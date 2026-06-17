import { FileUp } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';

/** Importación bidireccional de Excel con reconciliación por id (Fase 7, aislada). */
export function ExcelImport() {
  const reconcile = useFinanceStore((s) => s.reconcileFromExcel);
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      const buffer = await file.arrayBuffer();
      // ExcelJS se carga bajo demanda (chunk aparte).
      const { parseWorkbook } = await import('./importWorkbook');
      const parsed = await parseWorkbook(buffer);
      const { created, updated } = await reconcile(parsed.rows);
      setResult(
        `${created} ${t('excelImport.created')} · ${updated} ${t('excelImport.updated')}` +
          (parsed.errors.length > 0
            ? ` · ${parsed.errors.length} ${t('excelImport.errors')}`
            : ''),
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileUp className="size-4" />
          {t('excelImport.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <FileUp className="size-4" />
          {busy ? t('excel.generating') : t('excelImport.import')}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => void onFile(e)}
        />
        {result !== null && <p className="text-sm text-primary">{result}</p>}
        <p className="text-xs text-muted-foreground">{t('excelImport.help')}</p>
      </CardContent>
    </Card>
  );
}
