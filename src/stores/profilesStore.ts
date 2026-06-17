/**
 * stores/profilesStore — registro de perfiles locales (metadatos, persistido).
 *
 * Solo guarda id y nombre (no sensible). Cada perfil tiene su PROPIA base de
 * datos cifrada y su PIN; los datos jamás se comparten entre perfiles.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Profile {
  id: string;
  name: string;
}

interface ProfilesState {
  profiles: Profile[];
  activeId: string;
  addProfile: (name: string) => string;
  renameProfile: (id: string, name: string) => void;
  removeProfile: (id: string) => void;
  setActiveId: (id: string) => void;
}

const DEFAULT_PROFILE: Profile = { id: 'default', name: 'Principal' };

export const useProfilesStore = create<ProfilesState>()(
  persist(
    (set) => ({
      profiles: [DEFAULT_PROFILE],
      activeId: DEFAULT_PROFILE.id,

      addProfile: (name) => {
        const id = crypto.randomUUID();
        set((state) => ({
          profiles: [...state.profiles, { id, name }],
        }));
        return id;
      },

      renameProfile: (id, name) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, name } : p,
          ),
        })),

      removeProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
        })),

      setActiveId: (activeId) => set({ activeId }),
    }),
    { name: 'patrimonio-profiles' },
  ),
);
