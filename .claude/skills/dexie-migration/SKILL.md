---
name: dexie-migration
description: >
  Guía para evolucionar el esquema Dexie (IndexedDB) de Patrimonio sin perder
  datos. Actívala al añadir/modificar/eliminar una tabla o cambiar índices.
  Cubre cómo subir versión, escribir upgrades y migrar datos cifrados.
---

# dexie-migration

## Cuándo activarla

- Al añadir, modificar o eliminar una tabla.
- Al cambiar los índices de una tabla.
- Al transformar datos existentes (incluidos cifrados).

## Cómo subir de versión

El esquema vive en `src/lib/db/migrations.ts` como un array de versiones. **Nunca
modifiques una versión ya publicada**: añade una nueva al final e incrementa
`SCHEMA_VERSION`.

```ts
// src/lib/db/migrations.ts
export const SCHEMA_VERSION = 2; // <- incrementar

export const SCHEMA_VERSIONS = [
  {
    version: 1,
    stores: {
      accounts: 'id, type, currency, createdAt',
      // ...
    },
  },
  {
    version: 2,
    // En Dexie solo declaras las tablas que CAMBIAN (las demás se heredan).
    stores: {
      // nueva tabla, o nueva definición de índices de una existente:
      tags: 'id, name',
    },
    upgrade: async (tx) => {
      // Transformar datos existentes si hace falta.
      await tx
        .table('accounts')
        .toCollection()
        .modify((account) => {
          // mutar cada registro in-place
        });
    },
  },
];
```

`applySchema(db)` aplica todas las versiones en orden al construir la BD.

## Reglas

- Solo se indexan **campos no sensibles**; los cifrados (`EncryptedValue`) jamás.
- Para borrar una tabla en vN: declara `stores: { vieja: null }` en esa versión.
- Cambiar la clave primaria de una tabla NO se puede en Dexie: crea tabla nueva y
  migra.

## Migrar datos CIFRADOS (con cuidado)

Los `upgrade` de Dexie corren al abrir la BD, donde **puede que aún no haya clave
de sesión** (la app no está desbloqueada). Por tanto:

- Las migraciones de **estructura** (renombrar índices en claro, mover tablas) se
  hacen en el `upgrade`.
- Las migraciones que necesitan **descifrar/recifrar** valores sensibles NO se
  hacen en el `upgrade`. Hazlas tras el desbloqueo, como un paso de migración de
  datos a nivel de repositorio que comprueba `schemaVersion` en `AppMeta`.

## Checklist de prueba

- [ ] Probado con una BD **existente** (no solo vacía): crea datos en vN, sube a
      vN+1 y verifica que siguen accesibles.
- [ ] `pnpm test` en verde (tests con `fake-indexeddb`).
- [ ] `schemaVersion` de `AppMeta` actualizado si la migración de datos lo usa.
- [ ] Ningún campo cifrado quedó indexado.

## Errores comunes

- Editar una versión antigua → corrompe BDs de usuarios existentes.
- Intentar descifrar dentro de `upgrade` sin clave de sesión → falla.
- Olvidar incrementar `SCHEMA_VERSION`.
