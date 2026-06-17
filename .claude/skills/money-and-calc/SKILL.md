---
name: money-and-calc
description: >
  Reglas para escribir lógica con dinero o cálculo financiero en Patrimonio
  (patrimonio neto, FIRE, FinScore, presupuestos, Monte Carlo). Actívala siempre
  que toques importes o fórmulas. Prohíbe floats; exige el tipo Cents y tests.
---

# money-and-calc

## Cuándo activarla

Al escribir cualquier lógica con dinero o cálculo financiero.

## El tipo `Cents`

El dinero se representa SIEMPRE como **entero en céntimos**, con marca de tipo
(`Cents`) para impedir mezclarlo con números normales. **Prohibido usar floats**
para aritmética monetaria. Todo pasa por `src/lib/money`.

```ts
import {
  cents,
  toCents,
  fromCents,
  addCents,
  sumCents,
  scaleCents,
  formatMoney,
} from '@/lib/money';

const a = toCents(19.99); // 1999 (desde unidad mayor)
const b = cents(1000); // 1000 (ya en céntimos)
const total = addCents(a, b); // 2999
const lista = sumCents([a, b]); // 2999
const interes = scaleCents(cents(100_000), 0.029); // redondea al céntimo
formatMoney(total, 'es-ES', 'EUR'); // "29,99 €"
```

- Construye con `cents()` (ya en céntimos) o `toCents()` (desde euros).
- Opera con `addCents`/`subtractCents`/`sumCents`/`scaleCents`/`negateCents`.
- `fromCents()` SOLO para presentación/formateo.
- Redondeo: `scaleCents` redondea con `Math.round`; nunca trunques importes.

## Patrimonio neto (ejemplo)

```ts
import { sumCents, subtractCents, type Cents } from '@/lib/money';

export const netWorth = (assets: Cents[], liabilities: Cents[]): Cents =>
  subtractCents(sumCents(assets), sumCents(liabilities));
```

## Proyección (ejemplo FIRE simplificado)

```ts
import { scaleCents, addCents, type Cents } from '@/lib/money';

// Capital tras un año con aportación y rentabilidad anual.
export const projectYear = (
  capital: Cents,
  annualContribution: Cents,
  rate: number,
): Cents => addCents(scaleCents(capital, 1 + rate), annualContribution);
```

## Cálculos pesados → Web Workers

Las simulaciones (Monte Carlo) van en `src/workers/` con **math.js**, fuera del
hilo principal, para no bloquear la UI. La UI envía inputs y recibe resultados.

## Presentación

- Importes: `formatMoney(value, locale, currency)` (Intl).
- Fechas: **date-fns** para formatear; almacenamiento siempre ISO 8601 UTC.

## Tests obligatorios

Toda función de cálculo financiero lleva tests (ver `src/lib/money/index.test.ts`).
Cubre: redondeo, casos límite de floats (`0.1 + 0.2`), listas vacías, negativos.

## Errores comunes

- Usar `number` crudo para dinero → usa `Cents`.
- Multiplicar importes entre sí (céntimos × céntimos no tiene sentido) → escala
  por un factor adimensional con `scaleCents`.
- Formatear asumiendo separador de miles en tests (depende de ICU del entorno).
