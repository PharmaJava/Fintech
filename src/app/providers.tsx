import { useEffect, type ReactNode } from 'react';

import { useThemeStore } from '@/stores/themeStore';

/** Aplica el tema persistido al montar y cuando cambia. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}
