/**
 * features/excel/importWorkbook — importación bidireccional de Excel (Fase 7).
 *
 * AISLADO y a propósito separado de la exportación. Lee la hoja "Movimientos"
 * (la que genera la exportación, con columna `id`) y la valida con Zod. La
 * reconciliación por `id` la hace el store: actualiza los existentes e inserta
 * los nuevos (nunca borra, por seguridad).
 */
import ExcelJS from 'exceljs';
import { z } from 'zod';

import type { TransactionType } from '@/types/domain';

export interface ExcelTxnRow {
  id?: string;
  date: string;
  type: TransactionType;
  account: string;
  category: string;
  note: string;
  amount: number;
}

export interface ExcelParseResult {
  rows: ExcelTxnRow[];
  errors: { row: number; message: string }[];
}

const TYPE_ALIASES: Record<string, TransactionType> = {
  ingreso: 'income',
  income: 'income',
  gasto: 'expense',
  expense: 'expense',
  transferencia: 'transfer',
  transfer: 'transfer',
};

const rowSchema = z.object({
  id: z.string().trim().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida'),
  type: z
    .string()
    .transform((v) => TYPE_ALIASES[v.trim().toLowerCase()])
    .refine((v): v is TransactionType => v !== undefined, 'Tipo inválido'),
  account: z.string().trim().min(1),
  category: z.string().trim().min(1),
  note: z.string(),
  amount: z.number().finite(),
});

const cellText = (value: ExcelJS.CellValue): string => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'object' && 'text' in value) {
    return String((value as { text: unknown }).text);
  }
  return String(value);
};

const cellNumber = (value: ExcelJS.CellValue): number => {
  if (typeof value === 'number') return value;
  const parsed = Number(cellText(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

/** Parsea y valida la hoja "Movimientos" de un libro Excel. */
export const parseWorkbook = async (
  data: ArrayBuffer,
): Promise<ExcelParseResult> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(data);
  const sheet = workbook.getWorksheet('Movimientos') ?? workbook.worksheets[0];

  const rows: ExcelTxnRow[] = [];
  const errors: ExcelParseResult['errors'] = [];
  if (!sheet) {
    return { rows, errors: [{ row: 0, message: 'Sin hoja de movimientos' }] };
  }

  // Mapear columnas por cabecera (fila 1).
  const headers = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, col) => {
    headers.set(cellText(cell.value).trim().toLowerCase(), col);
  });
  const col = (name: string): number | undefined => headers.get(name);

  for (let r = 2; r <= sheet.rowCount; r += 1) {
    const row = sheet.getRow(r);
    const get = (name: string): ExcelJS.CellValue => {
      const c = col(name);
      return c ? row.getCell(c).value : null;
    };
    const rawAmount = cellNumber(get('importe'));
    const parsed = rowSchema.safeParse({
      id: cellText(get('id')) || undefined,
      date: cellText(get('fecha')),
      type: cellText(get('tipo')),
      account: cellText(get('cuenta')),
      category: cellText(get('categoria')),
      note: cellText(get('nota')),
      amount: rawAmount,
    });
    if (parsed.success) {
      const { id, ...rest } = parsed.data;
      rows.push({
        ...rest,
        amount: Math.abs(parsed.data.amount),
        ...(id !== undefined ? { id } : {}),
      });
    } else {
      errors.push({
        row: r,
        message: parsed.error.issues[0]?.message ?? 'Fila inválida',
      });
    }
  }

  return { rows, errors };
};
