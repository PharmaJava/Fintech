import { getDb } from '@/lib/db';
import type { StoredRecurringRule } from '@/lib/db';
import type { RecurringRule } from '@/types/domain';

import { decryptJson, encryptJson } from './fields';
import { SecureRepository } from './SecureRepository';

export type NewRecurringRule = Pick<
  RecurringRule,
  'templateTxn' | 'frequency' | 'nextRun'
>;

class RecurringRuleRepository extends SecureRepository<
  RecurringRule,
  StoredRecurringRule
> {
  constructor() {
    super(() => getDb().recurringRules);
  }

  protected async toStored(
    domain: RecurringRule,
    key: CryptoKey,
  ): Promise<StoredRecurringRule> {
    return {
      id: domain.id,
      frequency: domain.frequency,
      nextRun: domain.nextRun,
      templateTxn: await encryptJson(key, domain.templateTxn),
    };
  }

  protected async toDomain(
    stored: StoredRecurringRule,
    key: CryptoKey,
  ): Promise<RecurringRule> {
    return {
      id: stored.id,
      frequency: stored.frequency,
      nextRun: stored.nextRun,
      templateTxn: await decryptJson<RecurringRule['templateTxn']>(
        key,
        stored.templateTxn,
      ),
    };
  }

  async add(input: NewRecurringRule): Promise<RecurringRule> {
    return this.put({ id: crypto.randomUUID(), ...input });
  }
}

export const recurringRuleRepository = new RecurringRuleRepository();
