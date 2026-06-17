import { useEffect, useState } from 'react';

import { AppLayout } from '@/app/layout/AppLayout';
import { UnlockScreen } from '@/features/security/UnlockScreen';
import { useIsUnlocked } from '@/features/security/useSession';
import { setActiveProfile } from '@/lib/db';
import { useSeo } from '@/lib/seo';
import { useProfilesStore } from '@/stores/profilesStore';

/**
 * Puerta de la aplicación privada (/app):
 * - asegura que la base de datos del perfil activo esté abierta;
 * - bloqueada → pantalla de PIN; desbloqueada → layout navegable.
 *
 * Al cambiar de perfil (`activeId`), re-monta el contenido para que la pantalla
 * de desbloqueo verifique el PIN de la base de datos correcta.
 */
export function AppArea() {
  const unlocked = useIsUnlocked();
  const activeId = useProfilesStore((s) => s.activeId);
  const [ready, setReady] = useState(false);

  useSeo({
    title: 'Patrimonio — Tu app financiera privada',
    description:
      'Gestiona tu patrimonio neto, movimientos, presupuestos y FIRE de forma privada y cifrada.',
    path: '/app',
  });

  useEffect(() => {
    setReady(false);
    let active = true;
    void setActiveProfile(activeId).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [activeId]);

  if (!ready) {
    return <div className="min-h-dvh" />;
  }

  // `key` fuerza el re-montaje al cambiar de perfil.
  return unlocked ? <AppLayout /> : <UnlockScreen key={activeId} />;
}
