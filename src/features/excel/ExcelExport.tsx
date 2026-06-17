import { FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { snapshotAll } from '@/lib/repositories/maintenance';

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Boton para generar y descargar el libro Excel (ExcelJS cargado bajo demanda). */
export function ExcelExport() {
  const [busy, setBusy] = useState(false);

  const exportXlsx = async (): Promise<void> => {
    setBusy(true);
    try {
      // ExcelJS es pesado: se carga solo al exportar (chunk aparte).
      const [{ buildWorkbook }, snapshot] = await Promise.all([
        import('./buildWorkbook'),
        snapshotAll(),
      ]);
      const workbook = buildWorkbook(snapshot);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: XLSX_MIME });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `patrimonio-${new Date().toISOString().slice(0, 10)}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSpreadsheet className="size-4" />
          {t('excel.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void exportXlsx()}
        >
          <FileSpreadsheet className="size-4" />
          {busy ? t('excel.generating') : t('excel.export')}
        </Button>
        <p className="text-xs text-muted-foreground">{t('excel.help')}</p>
      </CardContent>
    </Card>
  );
}
