import { Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { t } from '@/i18n';
import { useProfilesStore } from '@/stores/profilesStore';

import { activateProfile, createProfile, deleteProfile } from './profiles';

/** Gestión de perfiles locales en Ajustes (crear, cambiar, borrar). */
export function ProfilesManager() {
  const profiles = useProfilesStore((s) => s.profiles);
  const activeId = useProfilesStore((s) => s.activeId);
  const [name, setName] = useState('');

  const add = (): void => {
    if (name.trim() === '') return;
    createProfile(name.trim());
    setName('');
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4" />
          {t('profiles.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <p className="text-xs text-muted-foreground">
          {t('profiles.subtitle')}
        </p>

        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('profiles.name')}
          />
          <Button size="icon" aria-label={t('profiles.add')} onClick={add}>
            <Plus className="size-4" />
          </Button>
        </div>

        <ul className="divide-y">
          {profiles.map((profile) => (
            <li
              key={profile.id}
              className="flex items-center justify-between gap-2 py-2"
            >
              <span className="min-w-0 truncate font-medium">
                {profile.name}
                {profile.id === activeId && (
                  <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                    {t('profiles.active')}
                  </span>
                )}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                {profile.id !== activeId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => activateProfile(profile.id)}
                  >
                    {t('profiles.switch')}
                  </Button>
                )}
                {profile.id !== activeId && profile.id !== 'default' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t('common.delete')}
                    onClick={() => void deleteProfile(profile.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
