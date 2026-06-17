/**
 * i18n — API minima de traduccion. Por ahora resuelve contra el locale activo
 * (es). Cuando haya mas idiomas, basta con cambiar `activeLocale`.
 */
import { messages, type Locale, type MessageKey } from './messages';

let activeLocale: Locale = 'es';

/** Cambia el idioma activo. */
export const setLocale = (locale: Locale): void => {
  activeLocale = locale;
};

/** Devuelve el idioma activo. */
export const getLocale = (): Locale => activeLocale;

/** Traduce una clave de mensaje al idioma activo. */
export const t = (key: MessageKey): string => messages[activeLocale][key];

export type { Locale, MessageKey };
