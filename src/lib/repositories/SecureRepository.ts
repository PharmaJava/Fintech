/**
 * lib/repositories/SecureRepository — repositorio base con cifrado transparente.
 *
 * Las subclases solo definen como mapear entre la forma de dominio (descifrada)
 * y la forma persistida (con campos sensibles cifrados). El cifrado/descifrado
 * y la obtencion de la clave de sesion quedan encapsulados aqui: las features
 * nunca ven el cifrado ni tocan Dexie directamente.
 */
import { requireSessionKey } from '@/lib/crypto';

/**
 * Subconjunto de la API de `Dexie.Table` que usa el repositorio. Tiparlo asi
 * (en vez de `Table<T, string>`) evita la friccion de los tipos genericos
 * `IDType`/`InsertType` de Dexie cuando `TStored` es un parametro de tipo.
 */
export interface SecureTable<TStored> {
  get(id: string): Promise<TStored | undefined>;
  put(item: TStored): Promise<unknown>;
  toArray(): Promise<TStored[]>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

export abstract class SecureRepository<
  TDomain extends { id: string },
  TStored extends { id: string },
> {
  /**
   * La tabla se resuelve de forma diferida (`getTable`) para soportar multi-perfil:
   * al cambiar de perfil, la base de datos activa cambia y el repositorio apunta
   * automáticamente a la tabla correcta.
   */
  protected constructor(
    protected readonly getTable: () => SecureTable<TStored>,
  ) {}

  protected get table(): SecureTable<TStored> {
    return this.getTable();
  }

  /** Mapea dominio -> registro persistido (cifrando campos sensibles). */
  protected abstract toStored(
    domain: TDomain,
    key: CryptoKey,
  ): Promise<TStored>;

  /** Mapea registro persistido -> dominio (descifrando campos sensibles). */
  protected abstract toDomain(
    stored: TStored,
    key: CryptoKey,
  ): Promise<TDomain>;

  /** Inserta o actualiza un registro. */
  async put(domain: TDomain): Promise<TDomain> {
    const key = requireSessionKey();
    const stored = await this.toStored(domain, key);
    await this.table.put(stored);
    return domain;
  }

  /** Devuelve un registro por id (descifrado) o `undefined`. */
  async getById(id: string): Promise<TDomain | undefined> {
    const key = requireSessionKey();
    const stored = await this.table.get(id);
    return stored ? this.toDomain(stored, key) : undefined;
  }

  /** Devuelve todos los registros (descifrados). */
  async getAll(): Promise<TDomain[]> {
    const key = requireSessionKey();
    const rows = await this.table.toArray();
    return Promise.all(rows.map((row) => this.toDomain(row, key)));
  }

  /** Borra un registro por id. */
  async delete(id: string): Promise<void> {
    await this.table.delete(id);
  }

  /** Numero de registros (no requiere descifrar). */
  count(): Promise<number> {
    return this.table.count();
  }
}
