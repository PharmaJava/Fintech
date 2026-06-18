/**
 * features/transactions/bankCsv — importador flexible de extractos bancarios.
 *
 * Los bancos exportan CSV en formatos muy distintos (delimitador, cabeceras,
 * formato de número y fecha, columnas Debe/Haber…). Este parser detecta el
 * delimitador, localiza la cabecera (saltando preámbulos) y mapea las columnas
 * de fecha, concepto e importe de forma tolerante. Devuelve importes con signo
 * en unidad mayor (negativo = gasto).
 */
export interface BankCsvRow {
  date: string; // YYYY-MM-DD
  concept: string;
  amount: number; // con signo (negativo = gasto)
}

export interface BankCsvParseResult {
  rows: BankCsvRow[];
  errors: { line: number; message: string }[];
}

const DELIMITERS = [';', ',', '\t', '|'] as const;

const detectDelimiter = (line: string): string => {
  let best = ';';
  let bestCount = -1;
  for (const d of DELIMITERS) {
    const count = line.split(d).length;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return best;
};

const splitLine = (line: string, delimiter: string): string[] => {
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
        } else inQuotes = false;
      } else current += char;
    } else if (char === '"') inQuotes = true;
    else if (char === delimiter) {
      fields.push(current.trim());
      current = '';
    } else current += char;
  }
  fields.push(current.trim());
  return fields;
};

const DATE_RE = /fecha|date/i;
const AMOUNT_RE = /importe|cantidad|monto|amount/i;
const CREDIT_RE = /haber|abono|ingreso|credit/i;
const DEBIT_RE = /debe|cargo|gasto|debit/i;
const CONCEPT_RE = /concepto|descrip|detalle|movimiento|operaci|concept|memo/i;

/** Convierte un texto de importe (es/en) a número. */
export const parseAmount = (raw: string): number => {
  const cleaned = raw.replace(/[^\d,.-]/g, '').trim();
  if (cleaned === '' || cleaned === '-') return Number.NaN;
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalized: string;
  if (lastComma > lastDot) {
    // Coma decimal: quita puntos de millar y usa punto decimal.
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // Punto decimal (o sin decimales): quita comas de millar.
    normalized = cleaned.replace(/,/g, '');
  }
  return Number(normalized);
};

/** Convierte una fecha (dd/mm/yyyy, dd-mm-yy, yyyy-mm-dd…) a YYYY-MM-DD. */
export const parseBankDate = (raw: string): string | null => {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
  if (!m) return null;
  const day = m[1]!.padStart(2, '0');
  const month = m[2]!.padStart(2, '0');
  const year = m[3]!.length === 2 ? `20${m[3]}` : m[3]!;
  const iso = `${year}-${month}-${day}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
};

const findIndex = (headers: string[], re: RegExp): number =>
  headers.findIndex((h) => re.test(h));

/** Parsea un extracto bancario en CSV de forma tolerante. */
export const parseBankCsv = (text: string): BankCsvParseResult => {
  const rows: BankCsvRow[] = [];
  const errors: BankCsvParseResult['errors'] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return { rows, errors };

  // Detectar la fila de cabecera: la primera con "fecha" + (importe o debe/haber).
  let headerIndex = lines.findIndex((line) => {
    const delim = detectDelimiter(line);
    const cells = splitLine(line, delim);
    return (
      cells.some((c) => DATE_RE.test(c)) &&
      cells.some(
        (c) => AMOUNT_RE.test(c) || CREDIT_RE.test(c) || DEBIT_RE.test(c),
      )
    );
  });
  if (headerIndex < 0) headerIndex = 0;

  const delimiter = detectDelimiter(lines[headerIndex]!);
  const headers = splitLine(lines[headerIndex]!, delimiter).map((h) =>
    h.toLowerCase(),
  );

  const dateCol = findIndex(headers, DATE_RE);
  const conceptCol = findIndex(headers, CONCEPT_RE);
  const amountCol = findIndex(headers, AMOUNT_RE);
  const creditCol = findIndex(headers, CREDIT_RE);
  const debitCol = findIndex(headers, DEBIT_RE);

  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const cells = splitLine(lines[i]!, delimiter);
    const date = dateCol >= 0 ? parseBankDate(cells[dateCol] ?? '') : null;

    let amount = Number.NaN;
    if (amountCol >= 0) {
      amount = parseAmount(cells[amountCol] ?? '');
    } else if (creditCol >= 0 || debitCol >= 0) {
      const credit = creditCol >= 0 ? parseAmount(cells[creditCol] ?? '') : 0;
      const debit = debitCol >= 0 ? parseAmount(cells[debitCol] ?? '') : 0;
      amount =
        (Number.isNaN(credit) ? 0 : credit) - (Number.isNaN(debit) ? 0 : debit);
    }

    if (!date || !Number.isFinite(amount)) {
      errors.push({ line: i + 1, message: 'Fecha o importe no válidos' });
      continue;
    }
    rows.push({
      date,
      concept: conceptCol >= 0 ? (cells[conceptCol] ?? '') : '',
      amount,
    });
  }

  return { rows, errors };
};
