import { describe, expect, it } from 'vitest';

import { cents } from '@/lib/money';
import type { Asset, Liability, Valuation } from '@/types/domain';

import {
  assetsByCategory,
  currentNetWorth,
  latestValuation,
  netWorthAt,
  netWorthSeries,
} from './networth';

const asset = (id: string, category: Asset['category']): Asset => ({
  id,
  name: `asset-${id}`,
  category,
  currency: 'EUR',
  createdAt: '2024-01-01T00:00:00.000Z',
});

const liability = (id: string, principal: number): Liability => ({
  id,
  name: `liab-${id}`,
  principal: cents(principal),
  createdAt: '2024-01-01T00:00:00.000Z',
});

const valuation = (
  refId: string,
  refType: Valuation['refType'],
  value: number,
  date: string,
): Valuation => ({
  id: `${refType}-${refId}-${date}`,
  refId,
  refType,
  value: cents(value),
  date,
  createdAt: `${date}T00:00:00.000Z`,
});

describe('features/networth', () => {
  it('latestValuation devuelve la mas reciente en o antes de asOf', () => {
    const vals = [
      valuation('a1', 'asset', 100, '2024-01-01'),
      valuation('a1', 'asset', 300, '2024-06-01'),
      valuation('a1', 'asset', 200, '2024-03-01'),
    ];
    expect(latestValuation(vals)?.value).toBe(300);
    expect(latestValuation(vals, '2024-03-01')?.value).toBe(200);
    expect(latestValuation(vals, '2023-12-01')).toBeUndefined();
  });

  it('calcula el patrimonio neto actual (activos - pasivos)', () => {
    const assets = [asset('a1', 'liquid'), asset('a2', 'invested')];
    const liabilities = [liability('l1', 5_000_00)];
    const vals = [
      valuation('a1', 'asset', 10_000_00, '2024-01-01'),
      valuation('a2', 'asset', 20_000_00, '2024-01-01'),
    ];

    const result = currentNetWorth(assets, liabilities, vals);
    expect(result.assets).toBe(30_000_00);
    expect(result.liabilities).toBe(5_000_00); // sin valoracion -> usa principal
    expect(result.net).toBe(25_000_00);
  });

  it('usa la ultima valoracion del pasivo si existe (no el principal)', () => {
    const liabilities = [liability('l1', 5_000_00)];
    const vals = [valuation('l1', 'liability', 4_000_00, '2024-05-01')];
    const result = currentNetWorth([], liabilities, vals);
    expect(result.liabilities).toBe(4_000_00);
    expect(result.net).toBe(-4_000_00);
  });

  it('netWorthAt respeta la fecha de corte', () => {
    const assets = [asset('a1', 'liquid')];
    const vals = [
      valuation('a1', 'asset', 100_00, '2024-01-01'),
      valuation('a1', 'asset', 150_00, '2024-06-01'),
    ];
    expect(netWorthAt('2024-03-01', assets, [], vals).net).toBe(100_00);
    expect(netWorthAt('2024-12-01', assets, [], vals).net).toBe(150_00);
  });

  it('construye la serie temporal ordenada por fecha', () => {
    const assets = [asset('a1', 'liquid')];
    const vals = [
      valuation('a1', 'asset', 150_00, '2024-06-01'),
      valuation('a1', 'asset', 100_00, '2024-01-01'),
    ];
    const series = netWorthSeries(assets, [], vals);
    expect(series.map((p) => p.date)).toEqual(['2024-01-01', '2024-06-01']);
    expect(series.map((p) => p.net)).toEqual([100_00, 150_00]);
  });

  it('agrupa el valor de activos por categoria', () => {
    const assets = [
      asset('a1', 'liquid'),
      asset('a2', 'liquid'),
      asset('a3', 'invested'),
    ];
    const vals = [
      valuation('a1', 'asset', 1_000_00, '2024-01-01'),
      valuation('a2', 'asset', 2_000_00, '2024-01-01'),
      valuation('a3', 'asset', 5_000_00, '2024-01-01'),
    ];
    const byCategory = assetsByCategory(assets, vals);
    expect(byCategory.get('liquid')).toBe(3_000_00);
    expect(byCategory.get('invested')).toBe(5_000_00);
  });
});
