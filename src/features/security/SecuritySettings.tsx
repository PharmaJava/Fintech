import { KeyRound, ShieldCheck, Upload } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';
import { useNetworthStore } from '@/stores/networthStore';
import { INACTIVITY_OPTIONS, useSettingsStore } from '@/stores/settingsStore';

import { changePin, MIN_PIN_LENGTH } from './auth';
import { createBackup, restoreBackup } from './backup';

function ChangePinDialog() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setMessage(null);
    if (next.length < MIN_PIN_LENGTH) {
      setMessage({ ok: false, text: t('unlock.error.short') });
      return;
    }
    if (next !== confirm) {
      setMessage({ ok: false, text: t('security.pinMismatch') });
      return;
    }
    setBusy(true);
    try {
      const ok = await changePin(current, next);
      if (!ok) {
        setMessage({ ok: false, text: t('security.pinWrong') });
        return;
      }
      setMessage({ ok: true, text: t('security.pinChanged') });
      setCurrent('');
      setNext('');
      setConfirm('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound className="size-4" />
          {t('security.changePin')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('security.changePin')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cur-pin">{t('security.currentPin')}</Label>
            <Input
              id="cur-pin"
              type="password"
              inputMode="numeric"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-pin">{t('security.newPin')}</Label>
            <Input
              id="new-pin"
              type="password"
              inputMode="numeric"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pin">{t('security.confirmPin')}</Label>
            <Input
              id="confirm-pin"
              type="password"
              inputMode="numeric"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {message !== null && (
            <p
              className={
                message.ok ? 'text-sm text-primary' : 'text-sm text-destructive'
              }
            >
              {message.text}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={busy}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Ajustes de seguridad: PIN, inactividad y backup cifrado. */
export function SecuritySettings() {
  const inactivityMinutes = useSettingsStore((s) => s.inactivityMinutes);
  const setInactivityMinutes = useSettingsStore((s) => s.setInactivityMinutes);
  const reloadFinance = useFinanceStore((s) => s.load);
  const reloadNetworth = useNetworthStore((s) => s.load);

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const exportBackup = async (): Promise<void> => {
    setMessage(null);
    try {
      const blob = await createBackup(password);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `patrimonio-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage({
        ok: false,
        text: error instanceof Error ? error.message : 'Error',
      });
    }
  };

  const onRestoreFile = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    setMessage(null);
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await restoreBackup(password, text);
      await Promise.all([reloadFinance(), reloadNetworth()]);
      setMessage({ ok: true, text: t('backup.restored') });
    } catch (error) {
      setMessage({
        ok: false,
        text: error instanceof Error ? error.message : 'Error',
      });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4" />
          {t('security.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm">{t('security.changePin')}</span>
          <ChangePinDialog />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="inactivity">{t('security.inactivity')}</Label>
          <Select
            id="inactivity"
            className="w-36"
            value={String(inactivityMinutes)}
            onChange={(e) => setInactivityMinutes(Number(e.target.value))}
          >
            {INACTIVITY_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} {t('security.minutes')}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2 border-t pt-3">
          <Label htmlFor="backup-pw">{t('backup.title')}</Label>
          <Input
            id="backup-pw"
            type="password"
            placeholder={t('backup.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => void exportBackup()}
            >
              <ShieldCheck className="size-4" />
              {t('backup.export')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-4" />
              {t('backup.import')}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => void onRestoreFile(e)}
            />
          </div>
          {message !== null && (
            <p
              className={
                message.ok ? 'text-sm text-primary' : 'text-sm text-destructive'
              }
            >
              {message.text}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{t('backup.help')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
