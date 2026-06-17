---
name: add-feature
description: >
  Orden canónico para crear una feature de dominio completa y coherente en
  Patrimonio (p. ej. presupuestos, metas). Actívala al empezar una feature nueva.
  Garantiza que se respeta la capa de repositorios y el cifrado.
---

# add-feature (vertical slice)

## Cuándo activarla

Al crear una nueva feature de dominio de principio a fin.

## Orden canónico

1. **Tipo de dominio** en `src/types/domain.ts` (forma descifrada). Importes como
   `Cents`, fechas como string ISO, id string.
2. **Esquema Zod** en `src/lib/validation/` para validar toda entrada externa y
   todo import (nunca confíes en datos sin validar).
3. **Tipo persistido + tabla**: `StoredX` en `src/lib/db/schema.ts` (sensibles
   como `EncryptedValue`) y la tabla en `src/lib/db/migrations.ts` (ver skill
   `dexie-migration`). Solo índices no sensibles.
4. **Repositorio** en `src/lib/repositories/xRepository.ts` extendiendo
   `SecureRepository` (ver skill `crypto-storage`). Singleton exportado +
   reexport en `index.ts`.
5. **Store Zustand** en `src/stores/` para el estado de UI (cargar, crear, etc.).
   El store llama al repositorio; **nunca** toca Dexie.
6. **Componentes** en `src/features/<feature>/`. Componentes pequeños, sin lógica
   de datos dentro; textos vía `t()` de `i18n`.
7. **Ruta** en `src/app/router.tsx` y enlace en `src/app/layout/Sidebar.tsx`.
8. **Tests**: round-trip del repositorio + tests de cualquier cálculo (ver skill
   `money-and-calc`).

## Regla de oro

> Los componentes y stores **NUNCA** tocan Dexie directamente. Todo dato pasa por
> `lib/repositories`. El cifrado es transparente y no debe verse en la feature.

## Ejemplo mínimo end-to-end (store → repo)

```ts
// src/stores/assetsStore.ts
import { create } from 'zustand';
import { assetRepository, type NewAsset } from '@/lib/repositories';
import type { Asset } from '@/types/domain';

interface AssetsState {
  assets: Asset[];
  load: () => Promise<void>;
  add: (input: NewAsset) => Promise<void>;
}

export const useAssetsStore = create<AssetsState>((set, get) => ({
  assets: [],
  load: async () => set({ assets: await assetRepository.getAll() }),
  add: async (input) => {
    await assetRepository.add(input);
    await get().load();
  },
}));
```

```tsx
// en un componente de la feature
const assets = useAssetsStore((s) => s.assets);
const load = useAssetsStore((s) => s.load);
useEffect(() => void load(), [load]);
```

## Checklist

- [ ] Tipo de dominio + Zod.
- [ ] `StoredX` + tabla/migración (índices no sensibles).
- [ ] Repositorio con cifrado transparente + reexport.
- [ ] Store que solo usa el repositorio.
- [ ] Componentes con `t()`, sin lógica de datos.
- [ ] Ruta + enlace en sidebar.
- [ ] Tests verdes.
