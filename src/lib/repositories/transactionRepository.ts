import { decryptString, encryptString } from '@/lib/crypto';
import { db } from '@/lib/db';
import type { StoredTransaction } from '@/lib/db';
import type { Transaction } from '@/types/domain';

import { decryptCents, encryptCents } from './fields';
import { SecureRepository } from './SecureRepository';

export type NewTransaction = Pick<
  Transaction,
  'type' | 'amount' | 'accountId' | 'categoryId' | 'date' | 'note' | 'tags'
>;

class TransactionRepository extends SecureRepository<
  Transaction,
  StoredTransaction
> {
  constructor() {
    super(db.transactions);
  }

  protected async toStored(
    domain: Transaction,
    key: CryptoKey,
  ): Promise<StoredTransaction> {
    return {
      id: domain.id,
      type: domain.type,
      accountId: domain.accountId,
      categoryId: domain.categoryId,
      date: domain.date,
      createdAt: domain.createdAt,
      tags: domain.tags,
      amount: await encryptCents(key, domain.amount),
      note: await encryptString(key, domain.note),
    };
  }

  protected async toDomain(
    stored: StoredTransaction,
    key: CryptoKey,
  ): Promise<Transaction> {
    return {
      id: stored.id,
      type: stored.type,
      accountId: stored.accountId,
      categoryId: stored.categoryId,
      date: stored.date,
      createdAt: stored.createdAt,
      tags: stored.tags,
      amount: await decryptCents(key, stored.amount),
      note: await decryptString(key, stored.note),
    };
  }

  async add(input: NewTransaction): Promise<Transaction> {
    return this.put({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    });
  }
}

export const transactionRepository = new TransactionRepository();
