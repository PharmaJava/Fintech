# CLAUDE.md — Memoria del proyecto "Patrimonio"

> Este documento es la memoria del proyecto para futuras sesiones. Mantenlo
> actualizado: cada vez que cambie una decisión de arquitectura o se complete
> una fase, actualiza la sección correspondiente.

---

## 1. Visión y propuesta de valor

**Patrimonio** es una **PWA local-first, cifrada y sin nube** cuyo corazón es el
**patrimonio neto real** (no es una app de gastos más). Combina:

- Control total del patrimonio neto: líquido, invertido, inmuebles, vehículos,
  otros activos y pasivos, con **histórico de valoraciones**.
- **Excel como columna vertebral** (en el MVP, solo exportación profesional).
- Motor de Independencia Financiera (FIRE), simuladores y FinScore (fases later).
- **Privacidad total**: los datos nunca salen del dispositivo.

**Público**: gente que ama Excel pero quiere algo moderno, privado y potente.

**Propuesta de valor a proteger en cada decisión**: privacidad local + patrimonio
neto real + puente con Excel. Si una feature compromete eso, se reconsidera.

Es una **aplicación web** (PWA instalable). Está publicada en
**https://pharmajava.github.io/Fintech/** (GitHub Pages, gratis). Preparada para
empaquetarse como app de **escritorio** (p. ej. Tauri) reutilizando el mismo
build: por eso se usan **solo APIs web estándar** (IndexedDB, Web Crypto…).

---

## 2. Principios no negociables

1. **Local-first de verdad**: cero llamadas a servidores propios, cero
   telemetría, cero analytics. La app debe funcionar sin conexión.
2. **Cifrado desde la línea 1**: jamás se persiste un dato sensible en claro.
   El cifrado NO es un añadido del final.
3. **El dinero se guarda como entero en la unidad mínima (céntimos)**. Tipo
   `Cents` (number con marca de tipo). **Prohibido** usar floats para aritmética
   monetaria. Toda operación pasa por `lib/money`.
4. **MVP = Excel SOLO EXPORTACIÓN (una dirección)**. La sincronización
   bidireccional es una fase posterior, aislada y diseñada aparte. No la
   implementes ahora aunque parezca fácil.
5. **IDs estables por registro**: cada entidad lleva un id string inmutable
   (`crypto.randomUUID()`). Necesario para el futuro Excel bidireccional y para
   no corromper datos.
6. **Toda lectura/escritura de datos pasa por la capa de repositorios**
   (`lib/repositories`). Los componentes y stores NUNCA tocan Dexie directamente.
7. **Las fechas se guardan en ISO 8601 UTC**; el formateo local se hace en UI.
8. **TypeScript estricto**: prohibido `any`. Usa `unknown` + validación.
9. **Mobile-first y responsive**: el grueso de usuarios/clientes usa móvil, así
   que se diseña **primero para móvil** y se escala hacia tablet/escritorio. Toda
   pantalla debe ser usable y cómoda en móvil (objetivos táctiles ≥ 40px,
   navegación inferior en móvil, sin scroll horizontal). Funciona bien en todas
   las plataformas, **especialmente en móvil**.

---

## 3. Stack técnico (cerrado)

| Pieza          | Tecnología                                         | Por qué                                     |
| -------------- | -------------------------------------------------- | ------------------------------------------- |
| Frontend       | React 19 + Vite + TypeScript (`strict`)            | Moderno, rápido, tipado fuerte              |
| Estilos        | TailwindCSS 3.4 + shadcn/ui                        | UI consistente y componible                 |
| Almacenamiento | Dexie.js (IndexedDB)                               | Persistencia local estructurada             |
| Cifrado        | Web Crypto API (`crypto.subtle`), AES-GCM + PBKDF2 | Estándar, sin libs externas                 |
| Estado         | Zustand                                            | Simple, sin boilerplate                     |
| Validación     | Zod                                                | Validar toda entrada externa/import         |
| Fechas         | date-fns                                           | Nunca aritmética manual de `Date`           |
| Gráficos       | Recharts                                           | Curvas de patrimonio                        |
| Excel          | ExcelJS (SheetJS solo para leer si hace falta)     | Export con estilos/fórmulas                 |
| Cálculo        | math.js + Web Workers                              | Monte Carlo (fases posteriores)             |
| Tests          | Vitest + Testing Library                           | Cálculo financiero con tests desde el día 1 |
| PWA            | `vite-plugin-pwa`                                  | Instalable, offline, service worker         |
| Lint/format    | ESLint + Prettier + Husky + lint-staged            | Calidad en pre-commit                       |
| Paquetes       | pnpm                                               | Rápido y eficiente                          |
| Deploy         | GitHub Actions → GitHub Pages                      | Web en vivo gratis                          |

> No cambiar el stack sin avisar. Versiones reales en `package.json`.

---

## 4. Arquitectura de carpetas

```
src/
  app/          # entry, providers, router, layout, páginas (routes)
  components/
    ui/         # componentes shadcn/ui
    shared/     # componentes reutilizables propios
  features/     # features de dominio (networth, transactions, security, excel…)
  lib/
    db/         # esquema Dexie + migraciones versionadas (único acceso a IndexedDB)
    crypto/     # AES-GCM, PBKDF2, clave de sesión en memoria
    money/      # tipo Cents + aritmética monetaria segura
    repositories/ # acceso a datos cifrado (único punto que toca Dexie)
    validation/ # esquemas Zod compartidos
    utils.ts    # helper cn() de shadcn
  stores/       # stores Zustand (estado de UI)
  workers/      # web workers (monte carlo, fases posteriores)
  types/        # tipos de dominio compartidos
  styles/       # globals, tokens de tema
  i18n/         # textos (es por defecto, estructura lista para más)
tests/          # tests de integración; los unit van junto al archivo
```

---

## 5. Modelo de datos (v1)

Forma **descifrada** (dominio) en `src/types/domain.ts`; forma **cifrada**
(persistida) en `src/lib/db/schema.ts`. `*` = campo sensible (cifrado). Todos los
importes son `Cents` (enteros) y se cifran.

- **Account** — `{ id, name*, type, currency, createdAt }`
- **Asset** — `{ id, name*, category(liquid|invested|real_estate|vehicle|other), currency, createdAt }`
- **Liability** — `{ id, name*, principal*(Cents), interestRate?, createdAt }`
- **Valuation** — `{ id, refId, refType, value*(Cents), date, createdAt }` — pieza
  que permite la **curva de patrimonio**. Sin histórico, no hay curva.
- **Transaction** — `{ id, type, amount*(Cents), accountId, categoryId, date, note*, tags[], createdAt }`
- **Category** — `{ id, name*, parentId?, kind, color }`
- **RecurringRule** — `{ id, templateTxn*, frequency, nextRun }`
- **Budget** — `{ id, categoryId, month, limit*(Cents) }`
- **Goal** — `{ id, name*, target*(Cents), current*(Cents), targetDate? }`
- **AppMeta** — `{ id:'app', salt, verifier(cifrado), schemaVersion, locale? }`

**Implementado en Fase 0**: repositorios de Account, Asset, Liability, Valuation.
El resto se implementa en su fase (ver skill `add-feature`).

---

## 6. Decisión y diseño de cifrado

Modelo **field-level (cifrado por campo)**:

- Los **campos sensibles** (importes, nombres, notas) se cifran con **AES-GCM**
  antes de persistir, como `EncryptedValue { iv, ct }` (ambos base64).
- Los **campos indexables no sensibles** (id, tipo, fecha, moneda, ids de
  relación) se guardan en claro para permitir queries/indexes de Dexie.
- **Derivación de clave**: PBKDF2 (210.000 iteraciones, SHA-256) a partir del PIN
  maestro + `salt` único por instalación guardado en `AppMeta`.
- La **clave de sesión vive solo en memoria** (`lib/crypto/session.ts`): nunca en
  disco ni localStorage. Se borra al bloquear o por inactividad (5 min por
  defecto).
- Cada valor cifrado lleva su propio **IV aleatorio**.
- Toda esta lógica vive tras `lib/crypto` + `SecureRepository`, de modo que las
  features no ven nunca el cifrado.

**Trade-off asumido y documentado**: los metadatos no sensibles (fechas, tipos)
quedan en claro a cambio de poder consultar/indexar. Aceptable para el MVP.

**Verificación de PIN**: en `AppMeta` se guarda un `verifier` (texto conocido
cifrado). Al desbloquear, se deriva la clave del PIN y se intenta descifrar; si
coincide, el PIN es correcto. El PIN nunca se guarda.

**Biometría**: FaceID/huella en PWA depende de WebAuthn y es limitado. En el MVP
hay **PIN maestro + bloqueo por inactividad**; WebAuthn queda como mejora futura.

---

## 7. Convenciones de código

- **TS estricto**, prohibido `any`; valida entradas externas con **Zod**.
- **Dinero** siempre `Cents`; nunca floats; todo vía `lib/money`.
- **Fechas** ISO 8601 UTC en almacenamiento; formateo en UI con date-fns/Intl.
- **Nombres en inglés**; **textos UI en español** vía `i18n` (`t('clave')`).
- Componentes pequeños; **lógica de datos fuera de los componentes**.
- Comentarios y documentación de usuario en español; código en inglés.
- `crypto.randomUUID()` para ids; `new Date().toISOString()` para fechas.
- **UI mobile-first**: estilos base para móvil y se amplían con breakpoints de
  Tailwind (`sm:`, `md:`, `lg:`). Navegación inferior en móvil y barra lateral en
  escritorio (`AppLayout`). Nada de scroll horizontal; objetivos táctiles ≥ 40px.

---

## 8. Reglas de seguridad y privacidad

- **Nunca loggear** datos sensibles (ni importes ni nombres).
- **Nunca persistir** importes/nombres en claro.
- La **clave de sesión solo vive en memoria** (nunca localStorage/IndexedDB).
- **Cero llamadas de red** a servidores; cero telemetría/analytics.
- Solo **APIs web estándar** (para portabilidad web → escritorio).
- `.gitignore` excluye `*.zip`, `*.xlsx`, `*.csv`, `backups/` (datos de usuario).

---

## 9. Capa de acceso a datos

Todo pasa por `lib/repositories`; componentes y stores **no tocan Dexie**.

**Cómo añadir un repositorio nuevo**:

1. Define el tipo de dominio en `src/types/domain.ts` y el tipo persistido
   (`StoredX`) en `src/lib/db/schema.ts` (campos sensibles como `EncryptedValue`).
2. Añade la tabla al esquema en `src/lib/db/migrations.ts` (solo indexa campos no
   sensibles).
3. Crea `src/lib/repositories/xRepository.ts` extendiendo `SecureRepository` e
   implementando `toStored`/`toDomain`. Exporta una instancia singleton.
4. Reexporta en `src/lib/repositories/index.ts`.
5. Añade un test de round-trip (ver `secureRepository.test.ts`).

Ver skill `crypto-storage` y `add-feature`.

---

## 10. Flujo de Git/GitHub

- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`…).
- Rama principal `main`; trabajo en ramas `feat/...`.
- Repo **público** (necesario para GitHub Pages gratis). Esto NO compromete la
  privacidad: solo el código es público; los datos del usuario son locales.
- **Nada de secretos en el repo**; revisar `.gitignore` antes de cada commit.
- Cada push a `main` despliega solo a GitHub Pages (`.github/workflows/deploy.yml`).

---

## 11. Testing

- **Vitest + Testing Library** (entorno jsdom; `fake-indexeddb` para Dexie).
- **Toda función de cálculo financiero lleva tests** (money, networth, FIRE…).
- Tests unitarios junto al archivo (`*.test.ts`); integración en `tests/`.
- Ejecutar: `pnpm test` (una pasada) o `pnpm test:watch`.

---

## 12. Comandos del proyecto

| Comando             | Qué hace                                                        |
| ------------------- | --------------------------------------------------------------- |
| `pnpm dev`          | Servidor de desarrollo (Vite, en `/`).                          |
| `pnpm build`        | Type-check (`tsc -b`) + build de producción (base `/Fintech/`). |
| `pnpm preview`      | Sirve el build (verificar PWA/offline).                         |
| `pnpm test`         | Tests con Vitest (una pasada).                                  |
| `pnpm test:watch`   | Tests en watch.                                                 |
| `pnpm lint`         | ESLint.                                                         |
| `pnpm format`       | Prettier (escribe).                                             |
| `pnpm format:check` | Prettier (solo comprueba).                                      |

Requisitos: Node 22+, pnpm 10+.

---

## 13. Roadmap por fases

- **Fase 0** ✅ (HECHA): scaffold + repo + capa de almacenamiento cifrado +
  esqueleto navegable + deploy a GitHub Pages + `CLAUDE.md` + skills.
- **Fase 1** ✅: Patrimonio neto (CRUD activos/pasivos, valoraciones con
  histórico, cálculo de patrimonio neto, curva de riqueza, donut por categoría).
- **Fase 2** ✅: Transacciones + categorías + cuentas + recurrentes +
  presupuestos + import/export CSV.
- **Fase 3** ✅: Seguridad completa (cambio de PIN con re-cifrado, bloqueo por
  intentos, inactividad configurable, backup cifrado AES).
- **Fase 4** ✅: Exportación Excel profesional (Resumen + Patrimonio +
  Movimientos + Presupuestos con fórmulas; ExcelJS lazy; una dirección).
- **Fase 5**: Motor FIRE + simulador + FinScore (Monte Carlo en Web Workers).
- **Fase 6**: Reglas automáticas, metas avanzadas, multi-perfil local.
- **Fase 7** (posterior, aislada): Excel bidireccional con reconciliación.

> **Estamos en**: Fases 1-4 completas. Siguiente: **Fase 5 (FIRE + FinScore)**.

Aviso a decidir más adelante: el "multi-dispositivo cifrado" choca con "100%
local" (sync E2E peer-to-peer o se descarta).

---

## 14. QUÉ NO HACER (lista negra)

- ❌ No añadir llamadas a la nube ni analytics.
- ❌ No implementar Excel bidireccional todavía (solo exportación).
- ❌ No usar floats para dinero (siempre `Cents`).
- ❌ No saltarse la capa de repositorios ni el cifrado.
- ❌ No introducir dependencias pesadas sin justificarlo.
- ❌ No usar APIs no estándar que rompan la portabilidad web → escritorio.
- ❌ No loggear ni persistir datos sensibles en claro.
- ❌ No diseñar solo para escritorio: mobile-first siempre (móvil es prioridad).

---

## 15. Glosario

- **Patrimonio neto**: activos − pasivos.
- **FIRE**: Financial Independence, Retire Early.
- **FI**: Independencia Financiera (cubrir gastos con rentas pasivas).
- **SWR** (Safe Withdrawal Rate): tasa de retiro segura (p. ej. 4%).
- **FinScore**: indicador propio de salud financiera.
- **Monte Carlo**: simulación con muchos escenarios aleatorios para proyecciones.
- **Local-first**: los datos viven y mandan en el dispositivo, sin nube.
- **Field-level encryption**: cifrar campo a campo (no toda la base).

---

## 16. Índice de skills disponibles

En `.claude/skills/`:

- **crypto-storage** — al persistir/leer una entidad o añadir un campo: cómo
  marcar campos sensibles y cómo cifra el `SecureRepository`.
- **dexie-migration** — al añadir/modificar tablas o índices: subir versión del
  esquema sin perder datos.
- **add-feature** — al crear una feature de dominio: orden canónico (tipo → Zod →
  Dexie → repositorio → store → componentes → ruta → tests).
- **money-and-calc** — al escribir lógica con dinero o cálculo financiero: `Cents`,
  redondeo, dónde van los cálculos pesados, formato.
- **excel-export** — al generar/ampliar la exportación a Excel (una dirección).
- **pwa-offline** — checklist de service worker, manifest y offline.
