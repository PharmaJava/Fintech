import { Coins } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { t } from '@/i18n';
import { CURRENCY_OPTIONS, useSettingsStore } from '@/stores/settingsStore';

/** Selector de la moneda de visualización (multidivisa a nivel de formato). */
export function CurrencyCard() {
  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Coins className="size-4" />
          {t('currency.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <Select
          aria-label={t('currency.title')}
          value={currency}
          onChange={(e) => {
            const option = CURRENCY_OPTIONS.find(
              (o) => o.currency === e.target.value,
            );
            if (option) setCurrency(option.currency, option.locale);
          }}
        >
          {CURRENCY_OPTIONS.map((o) => (
            <option key={o.currency} value={o.currency}>
              {o.label}
            </option>
          ))}
        </Select>
        <p className="text-xs text-muted-foreground">{t('currency.help')}</p>
      </CardContent>
    </Card>
  );
}
