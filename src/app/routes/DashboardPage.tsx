import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/i18n';

export function DashboardPage() {
  return (
    <>
      <PageHeader title={t('dashboard.title')} description={t('app.tagline')} />
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {t('dashboard.empty')}
        </CardContent>
      </Card>
    </>
  );
}
