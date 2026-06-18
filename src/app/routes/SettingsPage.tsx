import { Rocket } from 'lucide-react';
import { useEffect } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AccountsManager } from '@/features/accounts/AccountsManager';
import { CategoriesManager } from '@/features/categories/CategoriesManager';
import { ExcelExport } from '@/features/excel/ExcelExport';
import { ExcelImport } from '@/features/excel/ExcelImport';
import { ProfilesManager } from '@/features/profiles/ProfilesManager';
import { InstallCard } from '@/features/pwa/InstallCard';
import { CurrencyCard } from '@/features/settings/CurrencyCard';
import { LanguageCard } from '@/features/settings/LanguageCard';
import { JsonBackupCard } from '@/features/security/JsonBackupCard';
import { SecuritySettings } from '@/features/security/SecuritySettings';
import { CsvTools } from '@/features/transactions/CsvTools';
import { RulesManager } from '@/features/transactions/RulesManager';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

export function SettingsPage() {
  const load = useFinanceStore((s) => s.load);
  const openWizard = useOnboardingStore((s) => s.openWizard);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <PageHeader title={t('settings.title')} />
      <Card>
        <CardContent className="flex items-center justify-between gap-2 p-4">
          <span className="text-sm">{t('onboarding.launch')}</span>
          <Button size="sm" variant="outline" onClick={openWizard}>
            <Rocket className="size-4" />
            {t('onboarding.launch')}
          </Button>
        </CardContent>
      </Card>
      <InstallCard />
      <LanguageCard />
      <CurrencyCard />
      <ProfilesManager />
      <SecuritySettings />
      <AccountsManager />
      <CategoriesManager />
      <RulesManager />
      <CsvTools />
      <JsonBackupCard />
      <ExcelExport />
      <ExcelImport />
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          {t('settings.privacy')}
        </CardContent>
      </Card>
    </div>
  );
}
