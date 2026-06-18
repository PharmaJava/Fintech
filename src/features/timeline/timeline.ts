/**
 * features/timeline/timeline — construye la cronología financiera (puro, testeado).
 *
 * Interleva los eventos del usuario con su patrimonio neto en esa fecha, de modo
 * que cada hito muestra "dónde estabas" y cuánto se movió desde el evento
 * anterior. No inventa atribuciones: el patrimonio se calcula de los datos reales.
 */
import { netWorthAt } from '@/features/networth/networth';
import { subtractCents, type Cents } from '@/lib/money';
import type {
  Asset,
  FinancialEvent,
  Liability,
  Valuation,
} from '@/types/domain';

export interface TimelineEntry {
  event: FinancialEvent;
  /** Patrimonio neto a la fecha del evento. */
  netWorth: Cents;
  /** Cambio de patrimonio desde el evento anterior, o `null` si es el primero. */
  netWorthDelta: Cents | null;
}

export interface TimelineYear {
  year: string; // "2024"
  entries: TimelineEntry[]; // dentro del año, descendente por fecha
}

/** Orden cronológico estable: por fecha y, a igualdad, por `createdAt`. */
const chronological = (a: FinancialEvent, b: FinancialEvent): number =>
  a.date !== b.date
    ? a.date.localeCompare(b.date)
    : a.createdAt.localeCompare(b.createdAt);

/**
 * Agrupa los eventos por año (años descendentes, eventos recientes primero) y
 * adjunta el patrimonio neto y su variación respecto al evento anterior.
 */
export const buildTimeline = (
  events: readonly FinancialEvent[],
  assets: readonly Asset[],
  liabilities: readonly Liability[],
  valuations: readonly Valuation[],
): TimelineYear[] => {
  // Ascendente para calcular deltas respecto al evento previo.
  const ascending = [...events].sort(chronological);
  const entries: TimelineEntry[] = ascending.map((event, index) => {
    const netWorth = netWorthAt(
      event.date,
      assets,
      liabilities,
      valuations,
    ).net;
    const previous = index > 0 ? ascending[index - 1] : undefined;
    const previousNet =
      previous === undefined
        ? null
        : netWorthAt(previous.date, assets, liabilities, valuations).net;
    return {
      event,
      netWorth,
      netWorthDelta:
        previousNet === null ? null : subtractCents(netWorth, previousNet),
    };
  });

  // Agrupar por año, presentando lo más reciente primero.
  const byYear = new Map<string, TimelineEntry[]>();
  for (const entry of entries) {
    const year = entry.event.date.slice(0, 4);
    const list = byYear.get(year) ?? [];
    list.push(entry);
    byYear.set(year, list);
  }

  return [...byYear.keys()]
    .sort((a, b) => b.localeCompare(a))
    .map((year) => ({
      year,
      entries: (byYear.get(year) ?? [])
        .slice()
        .sort((a, b) => chronological(b.event, a.event)),
    }));
};
