import { decryptString, encryptString } from '@/lib/crypto';
import { db } from '@/lib/db';
import type { StoredGoal } from '@/lib/db';
import type { Goal } from '@/types/domain';

import { decryptCents, encryptCents } from './fields';
import { SecureRepository } from './SecureRepository';

export type NewGoal = Pick<Goal, 'name' | 'target' | 'current'> &
  Partial<Pick<Goal, 'targetDate'>>;

class GoalRepository extends SecureRepository<Goal, StoredGoal> {
  constructor() {
    super(db.goals);
  }

  protected async toStored(domain: Goal, key: CryptoKey): Promise<StoredGoal> {
    return {
      id: domain.id,
      name: await encryptString(key, domain.name),
      target: await encryptCents(key, domain.target),
      current: await encryptCents(key, domain.current),
      ...(domain.targetDate !== undefined
        ? { targetDate: domain.targetDate }
        : {}),
    };
  }

  protected async toDomain(stored: StoredGoal, key: CryptoKey): Promise<Goal> {
    return {
      id: stored.id,
      name: await decryptString(key, stored.name),
      target: await decryptCents(key, stored.target),
      current: await decryptCents(key, stored.current),
      ...(stored.targetDate !== undefined
        ? { targetDate: stored.targetDate }
        : {}),
    };
  }

  async add(input: NewGoal): Promise<Goal> {
    return this.put({ id: crypto.randomUUID(), ...input });
  }
}

export const goalRepository = new GoalRepository();
