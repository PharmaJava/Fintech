import { LayoutDashboard, Receipt, Settings, Wallet } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { t } from '@/i18n';
import type { MessageKey } from '@/i18n';

interface NavItem {
  to: string;
  labelKey: MessageKey;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/networth', labelKey: 'nav.networth', icon: Wallet },
  { to: '/transactions', labelKey: 'nav.transactions', icon: Receipt },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];

/** Navegacion lateral principal. */
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
