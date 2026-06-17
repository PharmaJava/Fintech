import { db } from '@/lib/db';
import type { StoredValuation } from '@/lib/db';
import type { RefType, Valuation } from '@/types/domain';

import { decryptCents, encryptCents } from './fields';
import { SecureRepository } from './SecureRepository';

export type NewValuation = Pick<
  Valuation,
  'refId' | 'refType' | 'value' | 'date'
>;

class ValuationRepository extends SecureRepository<Valuation, StoredValuation> {
  constructor() {
    super(db.valuations);
  }

  protected async toStored(
    domain: Valuation,
    key: CryptoKey,
  ): Promise<StoredValuation> {
    return {
      id: domain.id,
      refId: domain.refId,
      refType: domain.refType,
      date: domain.date,
      createdAt: domain.createdAt,
      value: await encryptCents(key, domain.value),
    };
  }

  protected async toDomain(
    stored: StoredValuation,
    key: CryptoKey,
  ): Promise<Valuation> {
    return {
      id: stored.id,
      refId: stored.refId,
      refType: stored.refType,
      date: stored.date,
      createdAt: stored.createdAt,
      value: await decryptCents(key, stored.value),
    };
  }

  /** Devuelve el historico de valoraciones de un activo/pasivo, mas reciente primero. */
  async getHistory(refType: RefType, refId: string): Promise<Valuation[]> {
    const all = await this.getAll();
    return all
      .filter((v) => v.refType === refType && v.refId === refId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  /** Crea y persiste una valoracion nueva con id y fecha de creacion generados. */
  async add(input: NewValuation): Promise<Valuation> {
    return this.put({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    });
  }
}

export const valuationRepository = new ValuationRepository();
