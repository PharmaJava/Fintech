import { RouterProvider } from 'react-router-dom';

import { router } from '@/app/router';
import { ThemeProvider } from '@/app/providers';
import { UnlockScreen } from '@/features/security/UnlockScreen';
import { useIsUnlocked } from '@/features/security/useSession';

/**
 * Raiz de la app: aplica el tema y decide entre la pantalla de desbloqueo
 * (bloqueada) y la app navegable (desbloqueada). El cifrado y los datos solo
 * son accesibles tras introducir el PIN.
 */
function App() {
  const unlocked = useIsUnlocked();

  return (
    <ThemeProvider>
      {unlocked ? <RouterProvider router={router} /> : <UnlockScreen />}
    </ThemeProvider>
  );
}

export default App;
