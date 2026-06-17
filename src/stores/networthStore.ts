/**
 * stores/networthStore — estado de la feature de patrimonio neto.
 *
 * Carga activos, pasivos y valoraciones (vía repositorios; nunca toca Dexie) y
 * expone acciones de creación/edición/borrado. El cálculo del patrimonio vive
 * en `features/networth/networth.ts` (puro y testeado).
 */
import { format } from 'date-fns';
import { create } from 'zustand';

import { toCents } from '@/lib/money';
import {
  assetRepository,
  liabilityRepository,
  valuationRepository,
} from '@/lib/repositories';
import type {
  Asset,
  AssetCategory,
  Liability,
  Valuation,
} from '@/types/domain';

const today = (): string => format(new Date(), 'yyyy-MM-dd');

interface AddAssetInput {
  name: string;
  category: AssetCategory;
  value: number;
}

interface AddLiabilityInput {
  name: string;
  principal: number;
  interestRatePercent?: number;
}

interface NetworthState {
  assets: Asset[];
  liabilities: Liability[];
  valuations: Valuation[];
  loaded: boolean;
  load: () => Promise<void>;
  addAsset: (input: AddAssetInput) => Promise<void>;
  updateAsset: (
    id: string,
    patch: { name: string; category: AssetCategory },
  ) => Promise<void>;
  addLiability: (input: AddLiabilityInput) => Promise<void>;
  updateLiability: (
    id: string,
    patch: { name: string; interestRatePercent?: number },
  ) => Promise<void>;
  addValuation: (
    refType: Valuation['refType'],
    refId: string,
    value: number,
    date: string,
  ) => Promise<void>;
  deleteValuation: (id: string) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  deleteLiability: (id: string) => Promise<void>;
}

export const useNetworthStore = create<NetworthState>((set, get) => ({
  assets: [],
  liabilities: [],
  valuations: [],
  loaded: false,

  load: async () => {
    const [assets, liabilities, valuations] = await Promise.all([
      assetRepository.getAll(),
      liabilityRepository.getAll(),
      valuationRepository.getAll(),
    ]);
    set({ assets, liabilities, valuations, loaded: true });
  },

  addAsset: async ({ name, category, value }) => {
    const asset = await assetRepository.add({
      name,
      category,
      currency: 'EUR',
    });
    await valuationRepository.add({
      refType: 'asset',
      refId: asset.id,
      value: toCents(value),
      date: today(),
    });
    await get().load();
  },

  updateAsset: async (id, patch) => {
    const existing = get().assets.find((a) => a.id === id);
    if (!existing) return;
    await assetRepository.put({ ...existing, ...patch });
    await get().load();
  },

  addLiability: async ({ name, principal, interestRatePercent }) => {
    await liabilityRepository.add({
      name,
      principal: toCents(principal),
      ...(interestRatePercent !== undefined
        ? { interestRate: interestRatePercent / 100 }
        : {}),
    });
    await get().load();
  },

  updateLiability: async (id, patch) => {
    const existing = get().liabilities.find((l) => l.id === id);
    if (!existing) return;
    const { interestRatePercent, name } = patch;
    await liabilityRepository.put({
      id: existing.id,
      createdAt: existing.createdAt,
      principal: existing.principal,
      name,
      ...(interestRatePercent !== undefined
        ? { interestRate: interestRatePercent / 100 }
        : {}),
    });
    await get().load();
  },

  addValuation: async (refType, refId, value, date) => {
    await valuationRepository.add({
      refType,
      refId,
      value: toCents(value),
      date,
    });
    await get().load();
  },

  deleteValuation: async (id) => {
    await valuationRepository.delete(id);
    await get().load();
  },

  deleteAsset: async (id) => {
    await assetRepository.delete(id);
    await get().load();
  },

  deleteLiability: async (id) => {
    await liabilityRepository.delete(id);
    await get().load();
  },
}));
