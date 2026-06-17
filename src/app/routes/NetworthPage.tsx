import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/i18n';

export function NetworthPage() {
  return (
    <>
      <PageHeader title={t('networth.title')} />
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {t('networth.empty')}
        </CardContent>
      </Card>
    </>
  );
}
