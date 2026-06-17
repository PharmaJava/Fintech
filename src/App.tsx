import { RouterProvider } from 'react-router-dom';

import { ThemeProvider } from '@/app/providers';
import { router } from '@/app/router';

/**
 * Raíz de la app: provee el tema y el router. El router separa la web pública
 * (landing + blog) de la aplicación privada (/app), gateada por PIN.
 */
function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
