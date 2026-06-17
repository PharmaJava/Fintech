/**
 * features/excel/buildWorkbook — exportacion profesional a Excel (ExcelJS).
 *
 * MVP: SOLO EXPORTACION (una direccion). Nada de import/sincronizacion.
 * Los importes se escriben como NUMERO en unidad mayor + formato de moneda, para
 * no perder precision y que las formulas (SUM, restas) operen sobre numeros.
 */
import ExcelJS from 'exceljs';

import { assetValue, liabilityValue } from '@/features/networth/networth';
import { categoryLabel } from '@/features/networth/labels';
import {
  monthOf,
  spendingByCategory,
} from '@/features/transactions/transactions';
import { transactionTypeLabel } from '@/features/transactions/labels';
import { fromCents } from '@/lib/money';
import type { DataSnapshot } from '@/lib/repositories/maintenance';

const MONEY_FMT = '#,##0.00 €';
const DATE_FMT = 'dd/mm/yyyy';
const HEADER_FILL = 'FF0F172A';

const styleHeader = (row: ExcelJS.Row): void => {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: HEADER_FILL },
    };
  });
};

/** Construye el libro Excel con Resumen, Patrimonio, Movimientos y Presupuestos. */
export const buildWorkbook = (snapshot: DataSnapshot): ExcelJS.Workbook => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Patrimonio';
  workbook.created = new Date();

  const accountName = new Map(snapshot.accounts.map((a) => [a.id, a.name]));
  const categoryName = new Map(snapshot.categories.map((c) => [c.id, c.name]));

  buildNetWorthSheet(workbook, snapshot);
  buildSummarySheet(workbook, snapshot);
  buildTransactionsSheet(workbook, snapshot, accountName, categoryName);
  buildBudgetsSheet(workbook, snapshot, categoryName);

  return workbook;
};

function buildSummarySheet(
  workbook: ExcelJS.Workbook,
  snapshot: DataSnapshot,
): void {
  const sheet = workbook.addWorksheet('Resumen');
  sheet.columns = [
    { header: 'Concepto', key: 'k', width: 28 },
    { header: 'Importe', key: 'v', width: 18, style: { numFmt: MONEY_FMT } },
  ];
  styleHeader(sheet.getRow(1));

  const assetsTotal = snapshot.assets.reduce(
    (sum, a) => sum + fromCents(assetValue(a, snapshot.valuations)),
    0,
  );
  const liabilitiesTotal = snapshot.liabilities.reduce(
    (sum, l) => sum + fromCents(liabilityValue(l, snapshot.valuations)),
    0,
  );

  sheet.addRow({ k: 'Activos', v: assetsTotal });
  sheet.addRow({ k: 'Pasivos', v: liabilitiesTotal });
  const netRow = sheet.addRow({ k: 'Patrimonio neto' });
  netRow.getCell('v').value = { formula: 'B2-B3' };
  netRow.font = { bold: true };
}

function buildNetWorthSheet(
  workbook: ExcelJS.Workbook,
  snapshot: DataSnapshot,
): void {
  const sheet = workbook.addWorksheet('Patrimonio');
  sheet.columns = [
    { header: 'Nombre', key: 'name', width: 30 },
    { header: 'Categoria', key: 'cat', width: 16 },
    { header: 'Valor', key: 'value', width: 18, style: { numFmt: MONEY_FMT } },
  ];
  styleHeader(sheet.getRow(1));

  for (const asset of snapshot.assets) {
    sheet.addRow({
      name: asset.name,
      cat: categoryLabel(asset.category),
      value: fromCents(assetValue(asset, snapshot.valuations)),
    });
  }
  const assetsEnd = sheet.rowCount;
  if (snapshot.assets.length > 0) {
    const totalRow = sheet.addRow({ name: 'Total activos' });
    totalRow.getCell('value').value = {
      formula: `SUM(C2:C${assetsEnd})`,
    };
    totalRow.font = { bold: true };
  }

  sheet.addRow({});
  const liabHeader = sheet.addRow({ name: 'Pasivos' });
  liabHeader.font = { bold: true };
  const liabStart = sheet.rowCount + 1;
  for (const liability of snapshot.liabilities) {
    sheet.addRow({
      name: liability.name,
      cat: 'Pasivo',
      value: fromCents(liabilityValue(liability, snapshot.valuations)),
    });
  }
  if (snapshot.liabilities.length > 0) {
    const totalRow = sheet.addRow({ name: 'Total pasivos' });
    totalRow.getCell('value').value = {
      formula: `SUM(C${liabStart}:C${sheet.rowCount - 1})`,
    };
    totalRow.font = { bold: true };
  }
}

function buildTransactionsSheet(
  workbook: ExcelJS.Workbook,
  snapshot: DataSnapshot,
  accountName: Map<string, string>,
  categoryName: Map<string, string>,
): void {
  const sheet = workbook.addWorksheet('Movimientos');
  sheet.columns = [
    { header: 'Fecha', key: 'date', width: 14, style: { numFmt: DATE_FMT } },
    { header: 'Tipo', key: 'type', width: 14 },
    { header: 'Cuenta', key: 'account', width: 20 },
    { header: 'Categoria', key: 'category', width: 20 },
    { header: 'Nota', key: 'note', width: 28 },
    {
      header: 'Importe',
      key: 'amount',
      width: 16,
      style: { numFmt: MONEY_FMT },
    },
  ];
  styleHeader(sheet.getRow(1));

  const sorted = [...snapshot.transactions].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  for (const txn of sorted) {
    const signed =
      txn.type === 'income' ? fromCents(txn.amount) : -fromCents(txn.amount);
    sheet.addRow({
      date: new Date(`${txn.date}T00:00:00`),
      type: transactionTypeLabel(txn.type),
      account: accountName.get(txn.accountId) ?? '',
      category: categoryName.get(txn.categoryId) ?? '',
      note: txn.note,
      amount: signed,
    });
  }
}

function buildBudgetsSheet(
  workbook: ExcelJS.Workbook,
  snapshot: DataSnapshot,
  categoryName: Map<string, string>,
): void {
  const sheet = workbook.addWorksheet('Presupuestos');
  sheet.columns = [
    { header: 'Mes', key: 'month', width: 12 },
    { header: 'Categoria', key: 'category', width: 20 },
    { header: 'Limite', key: 'limit', width: 16, style: { numFmt: MONEY_FMT } },
    {
      header: 'Gastado',
      key: 'spent',
      width: 16,
      style: { numFmt: MONEY_FMT },
    },
    {
      header: 'Restante',
      key: 'remaining',
      width: 16,
      style: { numFmt: MONEY_FMT },
    },
  ];
  styleHeader(sheet.getRow(1));

  const spendingByMonth = new Map<string, Map<string, number>>();
  const spendingFor = (month: string, categoryId: string): number => {
    let monthMap = spendingByMonth.get(month);
    if (!monthMap) {
      const computed = spendingByCategory(snapshot.transactions, month);
      monthMap = new Map(
        [...computed.entries()].map(([id, c]) => [id, fromCents(c)]),
      );
      spendingByMonth.set(month, monthMap);
    }
    return monthMap.get(categoryId) ?? 0;
  };

  const sorted = [...snapshot.budgets].sort((a, b) =>
    `${a.month}${a.categoryId}`.localeCompare(`${b.month}${b.categoryId}`),
  );
  for (const budget of sorted) {
    const row = sheet.addRow({
      month: budget.month,
      category: categoryName.get(budget.categoryId) ?? '',
      limit: fromCents(budget.limit),
      spent: spendingFor(monthOf(`${budget.month}-01`), budget.categoryId),
    });
    const rowIndex = row.number;
    row.getCell('remaining').value = {
      formula: `C${rowIndex}-D${rowIndex}`,
    };
  }
}
