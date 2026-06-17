import { getDb } from '@/lib/db';
import type { StoredBudget } from '@/lib/db';
import type { Budget } from '@/types/domain';

import { decryptCents, encryptCents } from './fields';
import { SecureRepository } from './SecureRepository';

export type NewBudget = Pick<Budget, 'categoryId' | 'month' | 'limit'>;

class BudgetRepository extends SecureRepository<Budget, StoredBudget> {
  constructor() {
    super(() => getDb().budgets);
  }

  protected async toStored(
    domain: Budget,
    key: CryptoKey,
  ): Promise<StoredBudget> {
    return {
      id: domain.id,
      categoryId: domain.categoryId,
      month: domain.month,
      limit: await encryptCents(key, domain.limit),
    };
  }

  protected async toDomain(
    stored: StoredBudget,
    key: CryptoKey,
  ): Promise<Budget> {
    return {
      id: stored.id,
      categoryId: stored.categoryId,
      month: stored.month,
      limit: await decryptCents(key, stored.limit),
    };
  }

  /** Inserta o actualiza el presupuesto de una categoria en un mes (id determinista). */
  async setBudget(input: NewBudget): Promise<Budget> {
    return this.put({ id: `${input.month}:${input.categoryId}`, ...input });
  }
}

export const budgetRepository = new BudgetRepository();
