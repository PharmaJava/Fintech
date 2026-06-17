import { AppLayout } from '@/app/layout/AppLayout';
import { UnlockScreen } from '@/features/security/UnlockScreen';
import { useIsUnlocked } from '@/features/security/useSession';
import { useSeo } from '@/lib/seo';

/**
 * Puerta de la aplicación privada (/app):
 * - bloqueada → pantalla de PIN.
 * - desbloqueada → layout navegable (con Outlet para las rutas hijas).
 */
export function AppArea() {
  const unlocked = useIsUnlocked();

  useSeo({
    title: 'Patrimonio — Tu app financiera privada',
    description:
      'Gestiona tu patrimonio neto, movimientos, presupuestos y FIRE de forma privada y cifrada.',
    path: '/app',
  });

  return unlocked ? <AppLayout /> : <UnlockScreen />;
}
