/**
 * stores/themeStore — preferencia de tema (claro/oscuro).
 *
 * El tema NO es un dato sensible, asi que se puede persistir en localStorage.
 * (Recordatorio: los datos sensibles y la clave de sesion NUNCA van a
 * localStorage.)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

/** Aplica el tema al elemento <html> anadiendo/quitando la clase `dark`. */
export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggle: () => {
        get().setTheme(get().theme === 'dark' ? 'light' : 'dark');
      },
    }),
    { name: 'patrimonio-theme' },
  ),
);
