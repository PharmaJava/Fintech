import { decryptString, encryptString } from '@/lib/crypto';
import { db } from '@/lib/db';
import type { StoredAccount } from '@/lib/db';
import type { Account } from '@/types/domain';

import { SecureRepository } from './SecureRepository';

export type NewAccount = Pick<Account, 'name' | 'type' | 'currency'>;

class AccountRepository extends SecureRepository<Account, StoredAccount> {
  constructor() {
    super(db.accounts);
  }

  protected async toStored(
    domain: Account,
    key: CryptoKey,
  ): Promise<StoredAccount> {
    return {
      id: domain.id,
      type: domain.type,
      currency: domain.currency,
      createdAt: domain.createdAt,
      name: await encryptString(key, domain.name),
    };
  }

  protected async toDomain(
    stored: StoredAccount,
    key: CryptoKey,
  ): Promise<Account> {
    return {
      id: stored.id,
      type: stored.type,
      currency: stored.currency,
      createdAt: stored.createdAt,
      name: await decryptString(key, stored.name),
    };
  }

  /** Crea y persiste una cuenta nueva con id y fecha generados. */
  async add(input: NewAccount): Promise<Account> {
    return this.put({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    });
  }
}

export const accountRepository = new AccountRepository();
