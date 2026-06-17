import { NavLink } from 'react-router-dom';

import { t } from '@/i18n';
import { cn } from '@/lib/utils';

import { NAV_ITEMS } from './navItems';

/** Navegacion lateral (solo escritorio, md+). */
export function Sidebar() {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map(({ to, labelKey, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end ?? false}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )
          }
        >
          <Icon className="size-4" />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}
