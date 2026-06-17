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
import { useSeo } from '@/lib/seo';

const FEATURES = [
  {
    icon: LineChart,
    title: 'Patrimonio neto real',
    text: 'Activos menos pasivos, con histórico de valoraciones y tu curva de riqueza.',
  },
  {
    icon: ShieldCheck,
    title: 'Cifrado de extremo a extremo',
    text: 'AES-GCM con clave derivada de tu PIN. Nada se guarda en claro.',
  },
  {
    icon: WifiOff,
    title: 'Local-first, sin nube',
    text: 'Funciona offline. Tus datos nunca salen del dispositivo. Cero telemetría.',
  },
  {
    icon: PiggyBank,
    title: 'Presupuestos y movimientos',
    text: 'Ingresos, gastos, recurrentes y límites por categoría. Todo bajo control.',
  },
  {
    icon: Flame,
    title: 'Motor FIRE + Monte Carlo',
    text: 'Calcula tu número, los años hasta la independencia y simula escenarios.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Puente con Excel',
    text: 'Exporta un libro profesional con fórmulas. Importa y exporta CSV.',
  },
];

const STEPS = [
  {
    title: 'Crea tu PIN',
    text: 'Se queda en tu dispositivo y cifra todos tus datos. Sin registro, sin email.',
  },
  {
    title: 'Añade tu patrimonio',
    text: 'Cuentas, activos, pasivos y movimientos. Tú decides el detalle.',
  },
  {
    title: 'Observa y decide',
    text: 'Tu curva de riqueza, tu FinScore y tu camino a la independencia financiera.',
  },
];

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
          <Lock className="size-3.5" /> Local-first · Cifrado · Sin nube
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Tu patrimonio neto real, <span className="text-primary">privado</span>{' '}
          y bajo tu control
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          No es otra app de gastos. Patrimonio mide lo que de verdad importa —tu
          riqueza neta— con cifrado de extremo a extremo y sin enviar tus datos
          a ningún servidor.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/app">
              Empezar gratis <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/blog">Leer el blog</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Sin registro · Sin tarjeta · Funciona offline
        </p>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Todo lo que necesitas, nada que te espíe
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <CardContent className="p-5">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Empieza en un minuto
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                {index + 1}
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy band */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
          <ShieldCheck className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight">
            Tu dinero es asunto tuyo
          </h2>
          <p className="mt-3 text-muted-foreground">
            El cifrado no es un extra: está desde la primera línea. La clave
            vive solo en memoria, los importes y nombres se guardan cifrados, y
            puedes hacer copias de seguridad cifradas con tu propia contraseña.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/app">
              Abrir la app <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
