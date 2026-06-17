---
name: excel-export
description: >
  Convenciones para generar/ampliar la exportación a Excel en Patrimonio con
  ExcelJS. Actívala al tocar la feature excel. RECORDATORIO: en el MVP es SOLO
  exportación (una dirección); nada de import/sincronización bidireccional.
---

# excel-export

## Cuándo activarla

Al generar o ampliar la exportación a Excel.

## Recordatorio clave

> En el MVP, Excel es **SOLO EXPORTACIÓN (una dirección)**. NO implementes
> lectura/sincronización bidireccional (es la Fase 7, aislada y aparte).

## Hojas estándar del libro

- **Dashboard**: KPIs y totales (patrimonio neto, activos, pasivos).
- **Transacciones**: movimientos con fecha, categoría, importe.
- **Patrimonio**: activos/pasivos y su histórico de valoraciones.
- **Presupuestos vs Real**: límite vs gastado por categoría/mes.
- **FIRE**: proyecciones (cuando exista el motor).

## Convenciones con ExcelJS

```ts
import ExcelJS from 'exceljs';
import { fromCents, type Cents } from '@/lib/money';

const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Patrimonio');

sheet.columns = [
  { header: 'Activo', key: 'name', width: 30 },
  { header: 'Valor', key: 'value', width: 16, style: { numFmt: '#,##0.00 €' } },
];

// Cents -> número en unidad mayor SOLO al escribir la celda (no pierde precisión:
// el valor entra como número y el formato lo muestra como moneda).
sheet.addRow({ name: assetName, value: fromCents(assetValueCents) });

// Totales con fórmula nativa de Excel (no un número calculado a mano):
const last = sheet.rowCount;
sheet.getCell(`B${last + 1}`).value = { formula: `SUM(B2:B${last})` };
```

## Mapear `Cents` a importes legibles

- Escribe el **número** (`fromCents(cents)`) en la celda, y aplica `numFmt` de
  moneda (p. ej. `'#,##0.00 €'`). Así Excel guarda el número exacto y lo muestra
  formateado; las fórmulas (`SUM`, etc.) operan sobre números reales.
- No escribas el importe como texto ya formateado: rompería las fórmulas.

## Estilos

- Cabeceras en negrita + fondo; columnas con anchura adecuada.
- Formato de moneda vía `numFmt`; fechas con `numFmt: 'dd/mm/yyyy'`.

## Checklist

- [ ] Solo exportación (sin import/sincronización).
- [ ] Importes escritos como número + `numFmt`, no como texto.
- [ ] Totales con fórmulas nativas de Excel.
- [ ] La generación corre con la app desbloqueada (datos descifrados vía repos).
- [ ] El `.xlsx` generado NO se commitea (está en `.gitignore`).
