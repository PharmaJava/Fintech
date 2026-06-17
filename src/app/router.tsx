import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from './layout/AppLayout';
import { BudgetsPage } from './routes/BudgetsPage';
import { DashboardPage } from './routes/DashboardPage';
import { NetworthPage } from './routes/NetworthPage';
import { SettingsPage } from './routes/SettingsPage';
import { TransactionsPage } from './routes/TransactionsPage';

// La app vive bajo /Fintech/ en GitHub Pages; en dev bajo /.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'networth', element: <NetworthPage /> },
        { path: 'transactions', element: <TransactionsPage /> },
        { path: 'budgets', element: <BudgetsPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ],
  { basename },
);
