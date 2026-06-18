import { Download, Share, SquarePlus } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import {
  canInstall,
  isIOS,
  isStandalone,
  promptInstall,
  subscribeInstall,
} from '@/lib/pwa/install';

function useCanInstall(): boolean {
  return useSyncExternalStore(
    subscribeInstall,
    () => canInstall(),
    () => false,
  );
}

/** Tarjeta para instalar la PWA (Android/escritorio con botón; iOS con pasos). */
export function InstallCard() {
  const installable = useCanInstall();

  if (isStandalone()) return null;

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="size-4" />
          {t('install.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        {installable ? (
          <Button size="sm" onClick={() => void promptInstall()}>
            <Download className="size-4" />
            {t('install.button')}
          </Button>
        ) : isIOS() ? (
          <p className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            {t('install.ios1')}
            <Share className="inline size-4" />
            {t('install.ios2')}
            <SquarePlus className="inline size-4" />
            {t('install.ios3')}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('install.generic')}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t('install.help')}</p>
      </CardContent>
    </Card>
  );
}
