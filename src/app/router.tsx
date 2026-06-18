import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppArea } from './AppArea';
import { BlogIndexPage } from './marketing/BlogIndexPage';
import { BlogPostPage } from './marketing/BlogPostPage';
import { LandingPage } from './marketing/LandingPage';
import { PublicLayout } from './marketing/PublicLayout';
import { BudgetsPage } from './routes/BudgetsPage';
import { DashboardPage } from './routes/DashboardPage';
import { FirePage } from './routes/FirePage';
import { NetworthPage } from './routes/NetworthPage';
import { SettingsPage } from './routes/SettingsPage';
import { TimelinePage } from '@/features/timeline/TimelinePage';
import { TransactionsPage } from './routes/TransactionsPage';

// La app vive bajo /Fintech/ en GitHub Pages; en dev bajo /.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export const router = createBrowserRouter(
  [
    {
      // Web pública (landing + blog).
      path: '/',
      element: <PublicLayout />,
      children: [
        { index: true, element: <LandingPage /> },
        { path: 'blog', element: <BlogIndexPage /> },
        { path: 'blog/:slug', element: <BlogPostPage /> },
      ],
    },
    {
      // Aplicación privada (gateada por PIN).
      path: '/app',
      element: <AppArea />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'networth', element: <NetworthPage /> },
        { path: 'timeline', element: <TimelinePage /> },
        { path: 'transactions', element: <TransactionsPage /> },
        { path: 'budgets', element: <BudgetsPage /> },
        { path: 'fire', element: <FirePage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  { basename },
);
