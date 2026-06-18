import { RouterProvider } from 'react-router-dom';

import { ThemeProvider } from '@/app/providers';
import { router } from '@/app/router';
import { setLocale } from '@/i18n';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Raíz de la app: provee el tema y el router. El router separa la web pública
 * (landing + blog) de la aplicación privada (/app), gateada por PIN.
 *
 * `t()` resuelve contra el locale activo de forma síncrona, así que al cambiar
 * de idioma remontamos el árbol con `key={language}` para refrescar los textos.
 */
function App() {
  const language = useSettingsStore((s) => s.language);
  setLocale(language);

  return (
    <ThemeProvider>
      <RouterProvider key={language} router={router} />
    </ThemeProvider>
  );
}

export default App;
