import { Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';

/** Cabecera + pie de la web pública (landing y blog). */
export function PublicLayout() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              P
            </span>
            <span>Patrimonio</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              Blog
            </NavLink>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cambiar tema"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
            <Button asChild size="sm">
              <Link to="/app">Abrir la app</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-1 sm:hidden">
            <Button asChild size="sm">
              <Link to="/app">Abrir app</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Menú"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t px-4 py-2 sm:hidden">
            <Link
              to="/"
              className="block py-2 text-sm"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/blog"
              className="block py-2 text-sm"
              onClick={() => setMenuOpen(false)}
            >
              Blog
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 text-sm text-muted-foreground">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <p className="font-semibold text-foreground">Patrimonio</p>
              <p className="mt-1 max-w-sm">
                Tu patrimonio neto real, privado y cifrado. Local-first, sin
                nube.
              </p>
            </div>
            <nav className="flex flex-col gap-1">
              <Link to="/" className="hover:text-foreground">
                Inicio
              </Link>
              <Link to="/blog" className="hover:text-foreground">
                Blog
              </Link>
              <Link to="/app" className="hover:text-foreground">
                Abrir la app
              </Link>
            </nav>
          </div>
          <p className="mt-6">
            © {new Date().getFullYear()} Patrimonio. Hecho con privacidad.
          </p>
        </div>
      </footer>
    </div>
  );
}
