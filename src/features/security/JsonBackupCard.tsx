import { Braces, Download, Upload } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';
import { useNetworthStore } from '@/stores/networthStore';

import { exportJson, importJson } from './jsonBackup';

/** Exportación/importación de todos los datos en JSON plano (portabilidad). */
export function JsonBackupCard() {
  const reloadFinance = useFinanceStore((s) => s.load);
  const reloadNetworth = useNetworthStore((s) => s.load);

  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const onExport = async (): Promise<void> => {
    setMessage(null);
    try {
      const json = await exportJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `patrimonio-datos-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage({
        ok: false,
        text: error instanceof Error ? error.message : 'Error',
      });
    }
  };

  const onImport = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    setMessage(null);
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      // La importación reemplaza todos los datos: confirmación explícita.
      if (!window.confirm(t('json.confirm'))) return;
      const text = await file.text();
      const count = await importJson(text);
      await Promise.all([reloadFinance(), reloadNetworth()]);
      setMessage({ ok: true, text: `${count} ${t('json.imported')}` });
    } catch (error) {
      const key = error instanceof Error ? error.message : 'Error';
      setMessage({
        ok: false,
        text: key === 'json.invalid' ? t('json.invalid') : key,
      });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Braces className="size-4" />
          {t('json.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void onExport()}>
            <Download className="size-4" />
            {t('json.export')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-4" />
            {t('json.import')}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void onImport(e)}
          />
        </div>
        {message !== null && (
          <p
            className={
              message.ok ? 'text-sm text-primary' : 'text-sm text-destructive'
            }
          >
            {message.text}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t('json.help')}</p>
      </CardContent>
    </Card>
  );
}
