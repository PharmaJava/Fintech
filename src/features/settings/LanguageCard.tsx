import { Languages } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { t, type Locale } from '@/i18n';
import { useSettingsStore } from '@/stores/settingsStore';

const LANGUAGE_OPTIONS: { value: Locale; labelKey: 'lang.es' | 'lang.en' }[] = [
  { value: 'es', labelKey: 'lang.es' },
  { value: 'en', labelKey: 'lang.en' },
];

/** Selector del idioma de la interfaz. */
export function LanguageCard() {
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Languages className="size-4" />
          {t('language.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <Select
          aria-label={t('language.title')}
          value={language}
          onChange={(e) => setLanguage(e.target.value as Locale)}
        >
          {LANGUAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </Select>
        <p className="text-xs text-muted-foreground">{t('language.help')}</p>
      </CardContent>
    </Card>
  );
}
