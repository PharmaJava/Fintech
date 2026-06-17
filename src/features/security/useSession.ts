/**
 * features/security/useSession — estado de bloqueo expuesto a React.
 *
 * Lee el estado de la clave de sesion (que vive en memoria en `lib/crypto`)
 * mediante `useSyncExternalStore`, sin duplicar la fuente de verdad.
 */
import { useSyncExternalStore } from 'react';

import { isUnlocked, subscribe } from '@/lib/crypto';

/** `true` si la app esta desbloqueada (hay clave de sesion en memoria). */
export const useIsUnlocked = (): boolean =>
  useSyncExternalStore(subscribe, isUnlocked, () => false);
