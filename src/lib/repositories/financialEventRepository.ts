import { decryptString, encryptString } from '@/lib/crypto';
import { getDb } from '@/lib/db';
import type { StoredFinancialEvent } from '@/lib/db';
import type { FinancialEvent } from '@/types/domain';

import { SecureRepository } from './SecureRepository';

export type NewFinancialEvent = Pick<
  FinancialEvent,
  'title' | 'date' | 'kind'
> &
  Partial<Pick<FinancialEvent, 'note'>>;

class FinancialEventRepository extends SecureRepository<
  FinancialEvent,
  StoredFinancialEvent
> {
  constructor() {
    super(() => getDb().financialEvents);
  }

  protected async toStored(
    domain: FinancialEvent,
    key: CryptoKey,
  ): Promise<StoredFinancialEvent> {
    return {
      id: domain.id,
      date: domain.date,
      kind: domain.kind,
      createdAt: domain.createdAt,
      title: await encryptString(key, domain.title),
      ...(domain.note !== undefined
        ? { note: await encryptString(key, domain.note) }
        : {}),
    };
  }

  protected async toDomain(
    stored: StoredFinancialEvent,
    key: CryptoKey,
  ): Promise<FinancialEvent> {
    return {
      id: stored.id,
      date: stored.date,
      kind: stored.kind,
      createdAt: stored.createdAt,
      title: await decryptString(key, stored.title),
      ...(stored.note !== undefined
        ? { note: await decryptString(key, stored.note) }
        : {}),
    };
  }

  async add(input: NewFinancialEvent): Promise<FinancialEvent> {
    return this.put({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    });
  }
}

export const financialEventRepository = new FinancialEventRepository();
