/**
 * stores/goalsStore — metas de ahorro (Fase 6). Vía repositorio cifrado.
 */
import { create } from 'zustand';

import { addCents, toCents } from '@/lib/money';
import { goalRepository } from '@/lib/repositories';
import type { Goal } from '@/types/domain';

interface GoalsState {
  goals: Goal[];
  load: () => Promise<void>;
  addGoal: (name: string, target: number, targetDate?: string) => Promise<void>;
  contribute: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],

  load: async () => {
    set({ goals: await goalRepository.getAll() });
  },

  addGoal: async (name, target, targetDate) => {
    await goalRepository.add({
      name,
      target: toCents(target),
      current: toCents(0),
      ...(targetDate ? { targetDate } : {}),
    });
    await get().load();
  },

  contribute: async (id, amount) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return;
    await goalRepository.put({
      ...goal,
      current: addCents(goal.current, toCents(amount)),
    });
    await get().load();
  },

  deleteGoal: async (id) => {
    await goalRepository.delete(id);
    await get().load();
  },
}));
