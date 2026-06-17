import { decryptString, encryptString } from '@/lib/crypto';
import { db } from '@/lib/db';
import type { StoredAutoRule } from '@/lib/db';
import type { AutoRule } from '@/types/domain';

import { SecureRepository } from './SecureRepository';

export type NewAutoRule = Pick<AutoRule, 'keyword' | 'categoryId'>;

class AutoRuleRepository extends SecureRepository<AutoRule, StoredAutoRule> {
  constructor() {
    super(db.autoRules);
  }

  protected async toStored(
    domain: AutoRule,
    key: CryptoKey,
  ): Promise<StoredAutoRule> {
    return {
      id: domain.id,
      categoryId: domain.categoryId,
      keyword: await encryptString(key, domain.keyword),
    };
  }

  protected async toDomain(
    stored: StoredAutoRule,
    key: CryptoKey,
  ): Promise<AutoRule> {
    return {
      id: stored.id,
      categoryId: stored.categoryId,
      keyword: await decryptString(key, stored.keyword),
    };
  }

  async add(input: NewAutoRule): Promise<AutoRule> {
    return this.put({ id: crypto.randomUUID(), ...input });
  }
}

export const autoRuleRepository = new AutoRuleRepository();
