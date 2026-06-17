import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/i18n';

export function TransactionsPage() {
  return (
    <>
      <PageHeader title={t('transactions.title')} />
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {t('transactions.empty')}
        </CardContent>
      </Card>
    </>
  );
}
