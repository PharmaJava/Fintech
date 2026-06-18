/**
 * stores/onboardingStore — estado del asistente de primer inicio.
 *
 * `completed` (por perfil) se persiste para no repetir el asistente. `open` es
 * transitorio: lo abre el primer desbloqueo o el botón de Ajustes.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  completed: Record<string, boolean>;
  open: boolean;
  openWizard: () => void;
  closeWizard: () => void;
  markCompleted: (profileId: string) => void;
  isCompleted: (profileId: string) => boolean;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      completed: {},
      open: false,
      openWizard: () => set({ open: true }),
      closeWizard: () => set({ open: false }),
      markCompleted: (profileId) =>
        set((state) => ({
          completed: { ...state.completed, [profileId]: true },
          open: false,
        })),
      isCompleted: (profileId) => get().completed[profileId] === true,
    }),
    {
      name: 'patrimonio-onboarding',
      partialize: (state) => ({ completed: state.completed }),
    },
  ),
);
