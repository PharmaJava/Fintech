import { describe, expect, it } from 'vitest';

import { cents } from '@/lib/money';
import type { Asset, FinancialEvent, Valuation } from '@/types/domain';

import { buildTimeline } from './timeline';

const asset: Asset = {
  id: 'a1',
  name: 'a1',
  category: 'cash',
  currency: 'EUR',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const valuation = (date: string, value: number): Valuation => ({
  id: `v-${date}`,
  refId: 'a1',
  refType: 'asset',
  value: cents(value),
  date,
  createdAt: `${date}T00:00:00.000Z`,
});

const event = (
  id: string,
  date: string,
  createdAt = `${date}T00:00:00.000Z`,
): FinancialEvent => ({
  id,
  title: id,
  date,
  kind: 'milestone',
  createdAt,
});

const valuations: Valuation[] = [
  valuation('2024-03-01', 100_000),
  valuation('2025-03-01', 160_000),
];

describe('buildTimeline', () => {
  it('agrupa por año descendente y patrimonio en cada fecha', () => {
    const events = [event('e1', '2024-06-01'), event('e2', '2025-06-01')];
    const timeline = buildTimeline(events, [asset], [], valuations);

    expect(timeline.map((y) => y.year)).toEqual(['2025', '2024']);
    expect(timeline[1]?.entries[0]?.netWorth).toBe(100_000); // 2024
    expect(timeline[0]?.entries[0]?.netWorth).toBe(160_000); // 2025
  });

  it('calcula el delta respecto al evento cronológico anterior', () => {
    const events = [event('e1', '2024-06-01'), event('e2', '2025-06-01')];
    const timeline = buildTimeline(events, [asset], [], valuations);

    // El primero (2024) no tiene anterior.
    expect(timeline[1]?.entries[0]?.netWorthDelta).toBeNull();
    // El segundo (2025): 160.000 - 100.000.
    expect(timeline[0]?.entries[0]?.netWorthDelta).toBe(60_000);
  });

  it('ordena eventos del mismo día por createdAt (estable)', () => {
    const events = [
      event('late', '2025-06-01', '2025-06-01T10:00:00.000Z'),
      event('early', '2025-06-01', '2025-06-01T08:00:00.000Z'),
    ];
    const timeline = buildTimeline(events, [asset], [], valuations);
    // Dentro del año, descendente: el más reciente (late) primero.
    expect(timeline[0]?.entries.map((e) => e.event.id)).toEqual([
      'late',
      'early',
    ]);
  });

  it('sin eventos devuelve una cronología vacía', () => {
    expect(buildTimeline([], [asset], [], valuations)).toEqual([]);
  });
});
