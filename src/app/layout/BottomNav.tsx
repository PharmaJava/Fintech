import { NavLink } from 'react-router-dom';

import { t } from '@/i18n';
import { cn } from '@/lib/utils';

import { NAV_ITEMS } from './navItems';

/** Navegacion inferior (solo movil). Patron mobile-first principal. */
export function BottomNav() {
  return (
    <nav
      className="sticky bottom-0 z-20 flex border-t bg-background md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map(({ to, labelKey, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end ?? false}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          <Icon className="size-5" />
          <span className="leading-none">{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
