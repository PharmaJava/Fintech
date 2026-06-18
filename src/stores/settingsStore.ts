/**
 * stores/settingsStore — preferencias no sensibles (persisten en localStorage).
 *
 * Inactividad y moneda de visualización NO son sensibles. Los datos sensibles y
 * la clave de sesión JAMÁS van a localStorage.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Locale } from '@/i18n';

interface SettingsState {
  inactivityMinutes: number;
  currency: string;
  locale: string;
  language: Locale;
  setInactivityMinutes: (minutes: number) => void;
  setCurrency: (currency: string, locale: string) => void;
  setLanguage: (language: Locale) => void;
}

export const INACTIVITY_OPTIONS = [1, 5, 15, 30, 60] as const;

/** Detecta el idioma inicial a partir del navegador (es por defecto). */
const detectLanguage = (): Locale => {
  if (typeof navigator === 'undefined') return 'es';
  return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es';
};

export interface CurrencyOption {
  currency: string;
  locale: string;
  label: string;
}

/** Monedas de visualización disponibles (formato local). */
export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { currency: 'EUR', locale: 'es-ES', label: 'Euro (€)' },
  { currency: 'USD', locale: 'en-US', label: 'Dólar EE.UU. ($)' },
  { currency: 'GBP', locale: 'en-GB', label: 'Libra (£)' },
  { currency: 'MXN', locale: 'es-MX', label: 'Peso mexicano ($)' },
  { currency: 'ARS', locale: 'es-AR', label: 'Peso argentino ($)' },
  { currency: 'COP', locale: 'es-CO', label: 'Peso colombiano ($)' },
  { currency: 'CLP', locale: 'es-CL', label: 'Peso chileno ($)' },
  { currency: 'BRL', locale: 'pt-BR', label: 'Real brasileño (R$)' },
  { currency: 'CHF', locale: 'de-CH', label: 'Franco suizo (CHF)' },
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      inactivityMinutes: 5,
      currency: 'EUR',
      locale: 'es-ES',
      language: detectLanguage(),
      setInactivityMinutes: (inactivityMinutes) => set({ inactivityMinutes }),
      setCurrency: (currency, locale) => set({ currency, locale }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'patrimonio-settings' },
  ),
);
