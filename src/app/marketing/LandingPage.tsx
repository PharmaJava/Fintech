import {
  ArrowRight,
  FileSpreadsheet,
  Flame,
  Lock,
  LineChart,
  PiggyBank,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { t, type MessageKey } from '@/i18n';
import { useSeo } from '@/lib/seo';

const FEATURES: { icon: typeof LineChart; key: string }[] = [
  { icon: LineChart, key: 'f1' },
  { icon: ShieldCheck, key: 'f2' },
  { icon: WifiOff, key: 'f3' },
  { icon: PiggyBank, key: 'f4' },
  { icon: Flame, key: 'f5' },
  { icon: FileSpreadsheet, key: 'f6' },
];

const STEPS = ['s1', 's2', 's3'];

export function LandingPage() {
  useSeo({
    title: 'Patrimonio — Controla tu patrimonio neto, privado y cifrado',
    description:
      'PWA local-first y cifrada para controlar tu patrimonio neto real: activos, pasivos, presupuestos, FIRE y Excel. Tus datos nunca salen de tu dispositivo.',
    path: '/',
  });

  return (
    <>
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:py-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          <Lock className="size-3.5" /> {t('landing.badge')}
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          {t('landing.hero.title.a')}{' '}
          <span className="text-primary">{t('landing.hero.title.b')}</span>{' '}
          {t('landing.hero.title.c')}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          {t('landing.hero.subtitle')}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/app">
              {t('landing.cta.start')} <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/blog">{t('landing.cta.blog')}</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {t('landing.hero.note')}
        </p>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            {t('landing.features.title')}
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, key }) => (
              <Card key={key}>
                <CardContent className="p-5">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">
                    {t(`landing.${key}.title` as MessageKey)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`landing.${key}.text` as MessageKey)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          {t('landing.steps.title')}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((key, index) => (
            <div key={key} className="text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                {index + 1}
              </div>
              <h3 className="mt-4 font-semibold">
                {t(`landing.${key}.title` as MessageKey)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`landing.${key}.text` as MessageKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy band */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
          <ShieldCheck className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight">
            {t('landing.privacy.title')}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t('landing.privacy.text')}
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/app">
              {t('landing.cta.open')} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
