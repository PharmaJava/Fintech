import { Lock } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProfileSwitcher } from '@/features/profiles/ProfileSwitcher';
import { t } from '@/i18n';

import {
  getLockRemainingMs,
  isPinConfigured,
  MIN_PIN_LENGTH,
  setupPin,
  unlockWithPin,
} from './auth';

/** Pantalla de desbloqueo: crea el PIN la primera vez o lo verifica despues. */
export function UnlockScreen() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lockMs, setLockMs] = useState(0);

  useEffect(() => {
    let active = true;
    void isPinConfigured().then((value) => {
      if (active) setConfigured(value);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const id = setInterval(() => {
      if (active) setLockMs(getLockRemainingMs());
    }, 500);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const isCreating = configured === false;

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (pin.length < MIN_PIN_LENGTH) {
      setError(t('unlock.error.short'));
      return;
    }

    setBusy(true);
    try {
      if (isCreating) {
        await setupPin(pin);
      } else {
        const ok = await unlockWithPin(pin);
        if (!ok) {
          setError(
            getLockRemainingMs() > 0
              ? t('security.locked')
              : t('unlock.error.wrong'),
          );
          setPin('');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6">
      <div className="w-full max-w-sm">
        <ProfileSwitcher />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-5" />
          </div>
          <CardTitle className="text-xl">
            {configured === null
              ? t('app.name')
              : isCreating
                ? t('unlock.create.title')
                : t('unlock.enter.title')}
          </CardTitle>
          <CardDescription>
            {isCreating
              ? t('unlock.create.subtitle')
              : t('unlock.enter.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={t('unlock.pin.placeholder')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={configured === null || busy || lockMs > 0}
            />
            {error !== null && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={configured === null || busy || lockMs > 0}
            >
              {isCreating
                ? t('unlock.submit.create')
                : t('unlock.submit.enter')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
