import { PartyPopper, Rocket } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { categoryLabel } from '@/features/networth/labels';
import { t } from '@/i18n';
import { ASSET_CATEGORIES } from '@/lib/validation/networth';
import { useFinanceStore } from '@/stores/financeStore';
import { useNetworthStore } from '@/stores/networthStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useProfilesStore } from '@/stores/profilesStore';
import type { AccountType, AssetCategory } from '@/types/domain';

const ACCOUNT_TYPES: AccountType[] = ['bank', 'cash', 'broker', 'other'];
const TOTAL_STEPS = 4;

/** Asistente de primer inicio: crea cuenta y primer activo en pocos pasos. */
export function OnboardingWizard() {
  const open = useOnboardingStore((s) => s.open);
  const markCompleted = useOnboardingStore((s) => s.markCompleted);
  const activeId = useProfilesStore((s) => s.activeId);

  const addAccount = useFinanceStore((s) => s.addAccount);
  const seed = useFinanceStore((s) => s.seedDefaultCategoriesIfEmpty);
  const addAsset = useNetworthStore((s) => s.addAsset);

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>('bank');
  const [assetName, setAssetName] = useState('');
  const [assetCat, setAssetCat] = useState<AssetCategory>('cash');
  const [assetValue, setAssetValue] = useState('');

  const finish = (): void => {
    markCompleted(activeId);
    setStep(0);
  };

  const next = async (): Promise<void> => {
    setBusy(true);
    try {
      if (step === 1 && accName.trim() !== '') {
        await addAccount(accName.trim(), accType);
        setAccName('');
      }
      if (step === 2 && assetName.trim() !== '' && Number(assetValue) > 0) {
        await addAsset({
          name: assetName.trim(),
          category: assetCat,
          value: Number(assetValue),
        });
        setAssetName('');
        setAssetValue('');
      }
      if (step === 0) await seed();
      if (step >= TOTAL_STEPS - 1) finish();
      else setStep((s) => s + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) finish();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === TOTAL_STEPS - 1 ? (
              <PartyPopper className="size-5 text-primary" />
            ) : (
              <Rocket className="size-5 text-primary" />
            )}
            {step === 0 && t('onboarding.welcome.title')}
            {step === 1 && t('onboarding.account.title')}
            {step === 2 && t('onboarding.asset.title')}
            {step === 3 && t('onboarding.done.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {t('onboarding.step')} {step + 1} {t('onboarding.of')} {TOTAL_STEPS}
          </p>

          {step === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('onboarding.welcome.text')}
            </p>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.account.text')}
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="ob-acc-name">{t('common.name')}</Label>
                <Input
                  id="ob-acc-name"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="Ej: Cuenta nómina"
                  autoFocus
                />
              </div>
              <Select
                value={accType}
                onChange={(e) => setAccType(e.target.value as AccountType)}
              >
                {ACCOUNT_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {t(`accounts.type.${tp}` as const)}
                  </option>
                ))}
              </Select>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.asset.text')}
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="ob-asset-name">{t('common.name')}</Label>
                <Input
                  id="ob-asset-name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder={t('onboarding.asset.name')}
                  autoFocus
                />
              </div>
              <Select
                value={assetCat}
                onChange={(e) => setAssetCat(e.target.value as AssetCategory)}
              >
                {ASSET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </Select>
              <div className="space-y-1.5">
                <Label htmlFor="ob-asset-value">
                  {t('networth.form.value')}
                </Label>
                <Input
                  id="ob-asset-value"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={assetValue}
                  onChange={(e) => setAssetValue(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <p className="text-sm text-muted-foreground">
              {t('onboarding.done.text')}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={finish}>
              {step === TOTAL_STEPS - 1
                ? t('onboarding.finish')
                : t('onboarding.skip')}
            </Button>
            <div className="flex gap-2">
              {step > 0 && step < TOTAL_STEPS - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep((s) => s - 1)}
                >
                  {t('onboarding.back')}
                </Button>
              )}
              <Button size="sm" disabled={busy} onClick={() => void next()}>
                {step === TOTAL_STEPS - 1
                  ? t('onboarding.finish')
                  : t('onboarding.next')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
