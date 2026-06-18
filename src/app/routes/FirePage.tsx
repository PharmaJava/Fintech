import { Play } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FinScoreCard } from '@/features/finscore/FinScoreCard';
import { fiNumber, projectValue, yearsToFI } from '@/features/fire/fire';
import { runMonteCarloAsync } from '@/features/fire/montecarloClient';
import type { MonteCarloResult } from '@/features/fire/montecarlo';
import {
  assetValue,
  INVERTIBLE_CATEGORIES,
} from '@/features/networth/networth';
import {
  monthSummary,
  monthsWithActivity,
} from '@/features/transactions/transactions';
import { t } from '@/i18n';
import { formatEur } from '@/lib/format';
import { cents, fromCents, toCents } from '@/lib/money';
import { useFinanceStore } from '@/stores/financeStore';
import { useNetworthStore } from '@/stores/networthStore';

type Field =
  | 'initial'
  | 'annualExpenses'
  | 'swr'
  | 'contribution'
  | 'ret'
  | 'vol'
  | 'horizon'
  | 'infl';

const eur = (major: number): string =>
  formatEur(cents(Math.round(major * 100)));

export function FirePage() {
  const loadNetworth = useNetworthStore((s) => s.load);
  const loadFinance = useFinanceStore((s) => s.load);
  const assets = useNetworthStore((s) => s.assets);
  const valuations = useNetworthStore((s) => s.valuations);
  const transactions = useFinanceStore((s) => s.transactions);

  const [overrides, setOverrides] = useState<Partial<Record<Field, string>>>(
    {},
  );
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadNetworth();
    void loadFinance();
  }, [loadNetworth, loadFinance]);

  const defaults = useMemo<Record<Field, number>>(() => {
    const invertible = assets
      .filter((a) => INVERTIBLE_CATEGORIES.has(a.category))
      .reduce((sum, a) => sum + fromCents(assetValue(a, valuations)), 0);
    const months = monthsWithActivity(transactions);
    const avgMonthlyExpense =
      months.length > 0
        ? months.reduce(
            (sum, m) => sum + fromCents(monthSummary(transactions, m).expense),
            0,
          ) / months.length
        : 0;
    return {
      initial: Math.round(invertible),
      annualExpenses: Math.round(avgMonthlyExpense * 12) || 20_000,
      swr: 4,
      contribution: 500,
      ret: 6,
      vol: 15,
      horizon: 20,
      infl: 2,
    };
  }, [assets, valuations, transactions]);

  const value = (field: Field): string =>
    overrides[field] ?? String(defaults[field]);
  const num = (field: Field): number => {
    const n = Number(value(field));
    return Number.isFinite(n) ? n : 0;
  };
  const setField = (field: Field, raw: string): void =>
    setOverrides((prev) => ({ ...prev, [field]: raw }));

  // Rentabilidad real (nominal descontada la inflacion). Mantiene FI number,
  // proyeccion y Monte Carlo en euros de hoy (poder adquisitivo comparable).
  const nominalReturn = num('ret') / 100;
  const inflation = num('infl') / 100;
  const realReturn = (1 + nominalReturn) / (1 + inflation) - 1;

  const fi = fiNumber(toCents(num('annualExpenses')), num('swr') / 100);
  const years = yearsToFI({
    current: toCents(num('initial')),
    monthlyContribution: toCents(num('contribution')),
    annualReturn: realReturn,
    target: fi,
  });
  const projected = projectValue(
    toCents(num('initial')),
    toCents(num('contribution')),
    realReturn,
    num('horizon'),
  );

  const runSimulation = async (): Promise<void> => {
    setBusy(true);
    try {
      const res = await runMonteCarloAsync({
        initial: num('initial'),
        monthlyContribution: num('contribution'),
        years: num('horizon'),
        annualReturnMean: nominalReturn,
        annualReturnStd: num('vol') / 100,
        target: fromCents(fi),
        runs: 1000,
        annualInflation: inflation,
      });
      setResult(res);
    } finally {
      setBusy(false);
    }
  };

  const fields: { field: Field; labelKey: Parameters<typeof t>[0] }[] = [
    { field: 'initial', labelKey: 'fire.initial' },
    { field: 'annualExpenses', labelKey: 'fire.annualExpenses' },
    { field: 'swr', labelKey: 'fire.swr' },
    { field: 'contribution', labelKey: 'fire.contribution' },
    { field: 'ret', labelKey: 'fire.return' },
    { field: 'vol', labelKey: 'fire.volatility' },
    { field: 'horizon', labelKey: 'fire.horizon' },
    { field: 'infl', labelKey: 'fire.inflation' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={t('fire.title')} description={t('fire.subtitle')} />

      <FinScoreCard />

      <Card>
        <CardContent className="grid grid-cols-2 gap-3 p-4">
          {fields.map(({ field, labelKey }) => (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={`fire-${field}`}>{t(labelKey)}</Label>
              <Input
                id={`fire-${field}`}
                type="number"
                inputMode="decimal"
                value={value(field)}
                onChange={(e) => setField(field, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t('fire.fiNumber')}
            </p>
            <p className="mt-1 font-semibold text-primary">{formatEur(fi)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t('fire.yearsToFI')}
            </p>
            <p className="mt-1 font-semibold">
              {years === null ? t('fire.never') : `${years} ${t('fire.years')}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t('fire.projected')}
            </p>
            <p className="mt-1 font-semibold">{formatEur(projected)}</p>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">{t('fire.realTermsNote')}</p>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 p-4">
          <CardTitle className="text-base">
            {t('fire.montecarlo.title')}
          </CardTitle>
          <Button
            size="sm"
            disabled={busy}
            onClick={() => void runSimulation()}
          >
            <Play className="size-4" />
            {busy ? t('fire.montecarlo.running') : t('fire.montecarlo.run')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          {result !== null && (
            <>
              <div className="rounded-md bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {t('fire.montecarlo.success')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {Math.round(result.successRate * 100)}%
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('fire.p10')}
                  </p>
                  <p className="font-semibold">{eur(result.p10)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('fire.p50')}
                  </p>
                  <p className="font-semibold">{eur(result.p50)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('fire.p90')}
                  </p>
                  <p className="font-semibold">{eur(result.p90)}</p>
                </div>
              </div>
              <div className="rounded-md border p-3 text-xs">
                <p className="mb-2 font-semibold">
                  {t('fire.assumptions.title')}
                </p>
                <dl className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between gap-2">
                    <dt>{t('fire.assumptions.realReturn')}</dt>
                    <dd className="tabular-nums">
                      {(result.realAnnualReturn * 100).toFixed(1)}%
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>{t('fire.assumptions.inflation')}</dt>
                    <dd className="tabular-nums">{num('infl')}%</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>{t('fire.assumptions.volatility')}</dt>
                    <dd className="tabular-nums">{num('vol')}%</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>{t('fire.assumptions.runs')}</dt>
                    <dd className="tabular-nums">1000</dd>
                  </div>
                </dl>
                <p className="mt-2">{t('fire.assumptions.success')}</p>
              </div>
            </>
          )}
          <p className="text-xs text-muted-foreground">
            {t('fire.disclaimer')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
