import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/i18n';

export function SettingsPage() {
  return (
    <>
      <PageHeader title={t('settings.title')} />
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {t('settings.privacy')}
        </CardContent>
      </Card>
    </>
  );
}
