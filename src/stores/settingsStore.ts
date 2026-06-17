/**
 * stores/settingsStore — preferencias no sensibles (persisten en localStorage).
 *
 * El minutaje de inactividad NO es sensible, asi que puede persistir. Los datos
 * sensibles y la clave de sesion JAMAS van a localStorage.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  inactivityMinutes: number;
  setInactivityMinutes: (minutes: number) => void;
}

export const INACTIVITY_OPTIONS = [1, 5, 15, 30, 60] as const;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      inactivityMinutes: 5,
      setInactivityMinutes: (inactivityMinutes) => set({ inactivityMinutes }),
    }),
    { name: 'patrimonio-settings' },
  ),
);
