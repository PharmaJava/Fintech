import {
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
  Wallet,
} from 'lucide-react';

import type { MessageKey } from '@/i18n';

export interface NavItem {
  to: string;
  labelKey: MessageKey;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

/** Items de navegacion, compartidos por la barra lateral (desktop) e inferior (movil). */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/networth', labelKey: 'nav.networth', icon: Wallet },
  { to: '/transactions', labelKey: 'nav.transactions', icon: Receipt },
  { to: '/budgets', labelKey: 'nav.budgets', icon: PiggyBank },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];
