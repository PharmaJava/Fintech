import { describe, expect, it } from 'vitest';

import { cents } from '@/lib/money';

import { fiNumber, projectValue, yearsToFI } from './fire';
import { mulberry32, runMonteCarlo } from './montecarlo';

describe('features/fire', () => {
  it('calcula el FI number con la regla del 4%', () => {
    expect(fiNumber(cents(20_000_00))).toBe(500_000_00); // 25x
    expect(fiNumber(cents(20_000_00), 0.05)).toBe(400_000_00); // 20x
  });

  it('devuelve 0 anos si ya se alcanzo el objetivo', () => {
    expect(
      yearsToFI({
        current: cents(600_000_00),
        monthlyContribution: cents(0),
        annualReturn: 0.05,
        target: cents(500_000_00),
      }),
    ).toBe(0);
  });

  it('estima anos hasta FI (crece con aportacion y rentabilidad)', () => {
    const years = yearsToFI({
      current: cents(100_000_00),
      monthlyContribution: cents(1_000_00),
      annualReturn: 0.06,
      target: cents(500_000_00),
    });
    expect(years).not.toBeNull();
    expect(years!).toBeGreaterThan(10);
    expect(years!).toBeLessThan(25);
  });

  it('devuelve null si no se alcanza en el horizonte', () => {
    expect(
      yearsToFI({
        current: cents(0),
        monthlyContribution: cents(10_00),
        annualReturn: 0,
        target: cents(100_000_000_00),
        maxYears: 5,
      }),
    ).toBeNull();
  });

  it('projectValue crece de forma monotona con el tiempo', () => {
    const v5 = projectValue(cents(10_000_00), cents(500_00), 0.05, 5);
    const v10 = projectValue(cents(10_000_00), cents(500_00), 0.05, 10);
    expect(v10).toBeGreaterThan(v5);
  });
});

describe('features/fire/montecarlo', () => {
  it('es determinista con la misma semilla', () => {
    const params = {
      initial: 100_000,
      monthlyContribution: 1_000,
      years: 20,
      annualReturnMean: 0.06,
      annualReturnStd: 0.15,
      target: 500_000,
      runs: 500,
    };
    const a = runMonteCarlo(params, 42);
    const b = runMonteCarlo(params, 42);
    expect(a).toEqual(b);
  });

  it('da percentiles ordenados y una tasa de exito en [0,1]', () => {
    const result = runMonteCarlo(
      {
        initial: 100_000,
        monthlyContribution: 1_000,
        years: 20,
        annualReturnMean: 0.06,
        annualReturnStd: 0.15,
        target: 500_000,
        runs: 1000,
      },
      7,
    );
    expect(result.p10).toBeLessThanOrEqual(result.p50);
    expect(result.p50).toBeLessThanOrEqual(result.p90);
    expect(result.successRate).toBeGreaterThanOrEqual(0);
    expect(result.successRate).toBeLessThanOrEqual(1);
  });

  it('ajusta por inflacion: rentabilidad real menor y resultados mas bajos', () => {
    const base = {
      initial: 100_000,
      monthlyContribution: 1_000,
      years: 20,
      annualReturnMean: 0.06,
      annualReturnStd: 0.15,
      target: 500_000,
      runs: 500,
    };
    const nominal = runMonteCarlo(base, 99);
    const real = runMonteCarlo({ ...base, annualInflation: 0.02 }, 99);

    // Sin inflacion, la rentabilidad real es la nominal.
    expect(nominal.realAnnualReturn).toBeCloseTo(0.06, 10);
    // Con 2% de inflacion, la real baja (~3.92%).
    expect(real.realAnnualReturn).toBeLessThan(nominal.realAnnualReturn);
    expect(real.realAnnualReturn).toBeCloseTo(1.06 / 1.02 - 1, 10);
    // Y el valor mediano final (en euros de hoy) es menor.
    expect(real.p50).toBeLessThan(nominal.p50);
  });

  it('mulberry32 produce numeros en [0,1)', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 100; i += 1) {
      const n = rng();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});
