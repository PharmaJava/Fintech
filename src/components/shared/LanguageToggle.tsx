import { Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { t } from '@/i18n';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Conmutador de idioma (es ↔ en). Persistido en settingsStore; el cambio
 * remonta el árbol en App para refrescar los textos.
 */
export function LanguageToggle() {
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t('lang.switch')}
      title={language === 'es' ? t('lang.en') : t('lang.es')}
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
    >
      <Languages className="size-4" />
      <span className="sr-only">{t('lang.switch')}</span>
    </Button>
  );
}
