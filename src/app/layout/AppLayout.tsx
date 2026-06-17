import { Lock, Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { t } from '@/i18n';
import { lock, resetInactivityTimer, setInactivityTimeout } from '@/lib/crypto';
import { useSettingsStore } from '@/stores/settingsStore';
import { useThemeStore } from '@/stores/themeStore';

import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

/**
 * Layout principal (mobile-first):
 * - Movil: cabecera + contenido + navegacion inferior (BottomNav).
 * - Escritorio (md+): cabecera + barra lateral (Sidebar) + contenido.
 */
export function AppLayout() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggle);
  const inactivityMinutes = useSettingsStore(
    (state) => state.inactivityMinutes,
  );

  // Aplica el tiempo de inactividad configurado (y re-arma el temporizador).
  useEffect(() => {
    setInactivityTimeout(inactivityMinutes * 60_000);
  }, [inactivityMinutes]);

  // Reinicia el temporizador de inactividad ante actividad del usuario.
  useEffect(() => {
    const onActivity = (): void => resetInactivityTimer();
    const events = ['pointerdown', 'keydown'] as const;
    for (const event of events) {
      window.addEventListener(event, onActivity);
    }
    return () => {
      for (const event of events) {
        window.removeEventListener(event, onActivity);
      }
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur">
        <span className="text-lg font-semibold tracking-tight">
          {t('app.name')}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t('action.theme.toggle')}
          >
            {theme === 'dark' ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => lock()}
            aria-label={t('action.lock')}
          >
            <Lock className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r md:block">
          <Sidebar />
        </aside>
        <main className="mx-auto w-full max-w-3xl flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
