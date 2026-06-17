---
name: crypto-storage
description: >
  Guía para persistir o leer entidades con cifrado field-level en Patrimonio.
  Actívala al añadir un campo a una entidad, crear una entidad nueva, o tocar
  cómo se guarda/lee un dato. Cubre qué cifrar, qué no, y el checklist anti-fugas.
---

# crypto-storage

## Cuándo activarla

- Al persistir o leer cualquier entidad nueva.
- Al añadir un campo a una entidad existente (¿es sensible?).
- Siempre que toques `lib/crypto`, `lib/repositories` o `lib/db/schema.ts`.

## Reglas

- **Sensible (se cifra)**: importes (`Cents`), nombres, notas, descripciones,
  cualquier dato del usuario que revele su situación. Se guarda como
  `EncryptedValue { iv, ct }`.
- **No sensible (en claro, indexable)**: `id`, tipo de entidad, fecha (ISO),
  moneda, ids de relación (`accountId`, `refId`…). Esto permite indexar en Dexie.
- **Nunca se indexa** un campo cifrado.

## Cómo funciona el SecureRepository

Las subclases solo implementan `toStored` (dominio → cifrado) y `toDomain`
(cifrado → dominio). El cifrado y la clave de sesión quedan encapsulados.

```ts
// src/lib/repositories/accountRepository.ts
class AccountRepository extends SecureRepository<Account, StoredAccount> {
  constructor() {
    super(db.accounts);
  }

  protected async toStored(d: Account, key: CryptoKey): Promise<StoredAccount> {
    return {
      id: d.id, // claro (indexable)
      type: d.type, // claro
      currency: d.currency, // claro
      createdAt: d.createdAt, // claro
      name: await encryptString(key, d.name), // sensible -> cifrado
    };
  }

  protected async toDomain(s: StoredAccount, key: CryptoKey): Promise<Account> {
    return {
      id: s.id,
      type: s.type,
      currency: s.currency,
      createdAt: s.createdAt,
      name: await decryptString(key, s.name),
    };
  }
}
export const accountRepository = new AccountRepository();
```

Para importes usa los helpers de `lib/repositories/fields.ts`:
`encryptCents`/`decryptCents` y `encryptJson`/`decryptJson`.

## Checklist anti-fugas

- [ ] ¿Los campos sensibles van como `EncryptedValue` en `StoredX`?
- [ ] ¿Ningún campo sensible está en la lista de índices de `migrations.ts`?
- [ ] ¿No hay `console.log` de importes/nombres? (sólo `warn`/`error`, sin datos).
- [ ] ¿Nada sensible va a `localStorage`/`sessionStorage`?
- [ ] ¿Cada valor cifrado usa su propio IV? (lo garantiza `encryptString`).
- [ ] ¿La operación obtiene la clave vía `requireSessionKey()` (app desbloqueada)?
- [ ] ¿Hay test de round-trip que verifica que el dato se guarda CIFRADO?

## Errores comunes

- Indexar un campo cifrado → no se puede consultar y rompe Dexie.
- Guardar `Cents` como número en claro "porque es solo un importe" → es sensible.
- Acceder a `db.*` desde un componente/store → SIEMPRE vía repositorio.
- Reusar IV → nunca; deja que `encryptString` genere uno por valor.
