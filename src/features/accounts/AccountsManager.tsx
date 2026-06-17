import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { t } from '@/i18n';
import { useFinanceStore } from '@/stores/financeStore';
import type { AccountType } from '@/types/domain';

const ACCOUNT_TYPES: AccountType[] = ['cash', 'bank', 'broker', 'other'];
const typeLabel = (type: AccountType): string =>
  t(`accounts.type.${type}` as const);

/** Gestion de cuentas (alta/baja) para Ajustes. */
export function AccountsManager() {
  const accounts = useFinanceStore((s) => s.accounts);
  const addAccount = useFinanceStore((s) => s.addAccount);
  const deleteAccount = useFinanceStore((s) => s.deleteAccount);

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');

  const add = async (): Promise<void> => {
    if (name.trim() === '') return;
    await addAccount(name.trim(), type);
    setName('');
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">{t('accounts.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('common.name')}
          />
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            className="w-32"
          >
            {ACCOUNT_TYPES.map((tp) => (
              <option key={tp} value={tp}>
                {typeLabel(tp)}
              </option>
            ))}
          </Select>
          <Button
            size="icon"
            aria-label={t('accounts.add')}
            onClick={() => void add()}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {accounts.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            {t('accounts.empty')}
          </p>
        ) : (
          <ul className="divide-y">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex items-center justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <span className="truncate font-medium">{account.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {typeLabel(account.type)}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={t('common.delete')}
                  onClick={() => void deleteAccount(account.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
