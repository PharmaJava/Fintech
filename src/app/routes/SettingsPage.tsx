import { useEffect } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { AccountsManager } from '@/features/accounts/AccountsManager';
import { CategoriesManager } from '@/features/categories/CategoriesManager';
import { SecuritySettings } from '@/features/security/SecuritySettings';
import { CsvTools } from '@/features/transactions/CsvTools';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';

export function SettingsPage() {
  const load = useFinanceStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <PageHeader title={t('settings.title')} />
      <SecuritySettings />
      <AccountsManager />
      <CategoriesManager />
      <CsvTools />
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          {t('settings.privacy')}
        </CardContent>
      </Card>
    </div>
  );
}
