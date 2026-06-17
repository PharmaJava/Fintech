/**
 * features/transactions/csv — exportacion e importacion CSV de movimientos.
 *
 * Toda fila importada se valida con Zod (nunca se confia en datos externos).
 * Importes en unidad mayor (euros); las tags van separadas por ';' para no
 * chocar con la coma del CSV.
 */
import { z } from 'zod';

import { fromCents } from '@/lib/money';
import type { Transaction } from '@/types/domain';

export const CSV_HEADER = [
  'date',
  'type',
  'amount',
  'account',
  'category',
  'note',
  'tags',
] as const;

const escapeField = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export interface CsvExportRow {
  date: string;
  type: Transaction['type'];
  amountCents: Transaction['amount'];
  account: string;
  category: string;
  note: string;
  tags: string[];
}

/** Serializa movimientos a CSV (con nombres de cuenta y categoria resueltos). */
export const toCsv = (rows: readonly CsvExportRow[]): string => {
  const lines = [CSV_HEADER.join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.date,
        row.type,
        String(fromCents(row.amountCents)),
        row.account,
        row.category,
        row.note,
        row.tags.join(';'),
      ]
        .map((field) => escapeField(field))
        .join(','),
    );
  }
  return lines.join('\n');
};

/** Parsea una linea CSV respetando comillas dobles. */
const parseLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
};

const csvRowSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha invalida (usa YYYY-MM-DD)')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha inexistente'),
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.coerce.number().nonnegative('Importe invalido'),
  account: z.string().trim().min(1, 'Cuenta obligatoria'),
  category: z.string().trim().min(1, 'Categoria obligatoria'),
  note: z.string().optional().default(''),
  tags: z.string().optional().default(''),
});

export type CsvImportRow = z.infer<typeof csvRowSchema>;

export interface CsvParseResult {
  rows: CsvImportRow[];
  errors: { line: number; message: string }[];
}

/** Parsea y valida un CSV de movimientos. Tolera cabecera presente o ausente. */
export const parseTransactionsCsv = (text: string): CsvParseResult => {
  const rows: CsvImportRow[] = [];
  const errors: CsvParseResult['errors'] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let startIndex = 0;
  if (lines[0]?.toLowerCase().startsWith('date,')) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i += 1) {
    const fields = parseLine(lines[i] ?? '');
    const [date, type, amount, account, category, note, tags] = fields;
    const parsed = csvRowSchema.safeParse({
      date,
      type,
      amount,
      account,
      category,
      note: note ?? '',
      tags: tags ?? '',
    });
    if (parsed.success) {
      rows.push(parsed.data);
    } else {
      errors.push({
        line: i + 1,
        message: parsed.error.issues[0]?.message ?? 'Fila invalida',
      });
    }
  }

  return { rows, errors };
};
