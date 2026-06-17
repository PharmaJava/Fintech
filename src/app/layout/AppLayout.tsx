import { Lock, Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { lock, resetInactivityTimer } from '@/lib/crypto';
import { t } from '@/i18n';
import { useThemeStore } from '@/stores/themeStore';

import { Sidebar } from './Sidebar';

/** Layout principal: cabecera + barra lateral + contenido (Outlet). */
export function AppLayout() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggle);

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
      <header className="flex items-center justify-between border-b px-4 py-3">
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
        <aside className="w-56 shrink-0 border-r">
          <Sidebar />
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
