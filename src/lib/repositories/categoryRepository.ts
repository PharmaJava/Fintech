import { decryptString, encryptString } from '@/lib/crypto';
import { db } from '@/lib/db';
import type { StoredCategory } from '@/lib/db';
import type { Category } from '@/types/domain';

import { SecureRepository } from './SecureRepository';

export type NewCategory = Pick<Category, 'name' | 'kind' | 'color'> &
  Partial<Pick<Category, 'parentId'>>;

class CategoryRepository extends SecureRepository<Category, StoredCategory> {
  constructor() {
    super(db.categories);
  }

  protected async toStored(
    domain: Category,
    key: CryptoKey,
  ): Promise<StoredCategory> {
    return {
      id: domain.id,
      kind: domain.kind,
      color: domain.color,
      name: await encryptString(key, domain.name),
      ...(domain.parentId !== undefined ? { parentId: domain.parentId } : {}),
    };
  }

  protected async toDomain(
    stored: StoredCategory,
    key: CryptoKey,
  ): Promise<Category> {
    return {
      id: stored.id,
      kind: stored.kind,
      color: stored.color,
      name: await decryptString(key, stored.name),
      ...(stored.parentId !== undefined ? { parentId: stored.parentId } : {}),
    };
  }

  async add(input: NewCategory): Promise<Category> {
    return this.put({ id: crypto.randomUUID(), ...input });
  }
}

export const categoryRepository = new CategoryRepository();
