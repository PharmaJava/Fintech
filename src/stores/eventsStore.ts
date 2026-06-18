/**
 * stores/eventsStore — eventos de la cronología financiera. Vía repositorio
 * cifrado (title y note son sensibles). Nunca toca Dexie directamente.
 */
import { create } from 'zustand';

import {
  financialEventRepository,
  type NewFinancialEvent,
} from '@/lib/repositories';
import type { FinancialEvent } from '@/types/domain';

interface EventsState {
  events: FinancialEvent[];
  load: () => Promise<void>;
  addEvent: (input: NewFinancialEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],

  load: async () => {
    set({ events: await financialEventRepository.getAll() });
  },

  addEvent: async (input) => {
    await financialEventRepository.add(input);
    await get().load();
  },

  deleteEvent: async (id) => {
    await financialEventRepository.delete(id);
    await get().load();
  },
}));
