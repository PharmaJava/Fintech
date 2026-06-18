import { useEffect, type ReactNode } from 'react';

import { setMoneyFormat } from '@/lib/format';
import { useSettingsStore } from '@/stores/settingsStore';
import { useThemeStore } from '@/stores/themeStore';

/** Aplica el tema y la moneda de visualización persistidos. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const currency = useSettingsStore((state) => state.currency);
  const locale = useSettingsStore((state) => state.locale);
  const language = useSettingsStore((state) => state.language);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    setMoneyFormat(locale, currency);
  }, [locale, currency]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <>{children}</>;
}
