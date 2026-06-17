import { decryptString, encryptString } from '@/lib/crypto';
import { db } from '@/lib/db';
import type { StoredAsset } from '@/lib/db';
import type { Asset } from '@/types/domain';

import { SecureRepository } from './SecureRepository';

export type NewAsset = Pick<Asset, 'name' | 'category' | 'currency'>;

class AssetRepository extends SecureRepository<Asset, StoredAsset> {
  constructor() {
    super(db.assets);
  }

  protected async toStored(
    domain: Asset,
    key: CryptoKey,
  ): Promise<StoredAsset> {
    return {
      id: domain.id,
      category: domain.category,
      currency: domain.currency,
      createdAt: domain.createdAt,
      name: await encryptString(key, domain.name),
    };
  }

  protected async toDomain(
    stored: StoredAsset,
    key: CryptoKey,
  ): Promise<Asset> {
    return {
      id: stored.id,
      category: stored.category,
      currency: stored.currency,
      createdAt: stored.createdAt,
      name: await decryptString(key, stored.name),
    };
  }

  /** Crea y persiste un activo nuevo con id y fecha generados. */
  async add(input: NewAsset): Promise<Asset> {
    return this.put({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    });
  }
}

export const assetRepository = new AssetRepository();
