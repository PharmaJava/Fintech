import { decryptString, encryptString } from '@/lib/crypto';
import { db } from '@/lib/db';
import type { StoredLiability } from '@/lib/db';
import type { Liability } from '@/types/domain';

import { decryptCents, encryptCents } from './fields';
import { SecureRepository } from './SecureRepository';

export type NewLiability = Pick<
  Liability,
  'name' | 'principal' | 'interestRate'
>;

class LiabilityRepository extends SecureRepository<Liability, StoredLiability> {
  constructor() {
    super(db.liabilities);
  }

  protected async toStored(
    domain: Liability,
    key: CryptoKey,
  ): Promise<StoredLiability> {
    return {
      id: domain.id,
      createdAt: domain.createdAt,
      name: await encryptString(key, domain.name),
      principal: await encryptCents(key, domain.principal),
      // interestRate no es muy sensible y no se indexa: se guarda en claro.
      ...(domain.interestRate !== undefined
        ? { interestRate: domain.interestRate }
        : {}),
    };
  }

  protected async toDomain(
    stored: StoredLiability,
    key: CryptoKey,
  ): Promise<Liability> {
    return {
      id: stored.id,
      createdAt: stored.createdAt,
      name: await decryptString(key, stored.name),
      principal: await decryptCents(key, stored.principal),
      ...(stored.interestRate !== undefined
        ? { interestRate: stored.interestRate }
        : {}),
    };
  }

  /** Crea y persiste un pasivo nuevo con id y fecha generados. */
  async add(input: NewLiability): Promise<Liability> {
    return this.put({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    });
  }
}

export const liabilityRepository = new LiabilityRepository();
