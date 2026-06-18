import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useSettingsStore } from '@/stores/settingsStore';

import App from './App';

describe('App', () => {
  beforeEach(() => {
    // Idioma determinista para el test (el default depende del navegador).
    useSettingsStore.getState().setLanguage('es');
  });

  it('muestra la landing pública en la raíz', async () => {
    render(<App />);
    expect(
      await screen.findByRole('link', { name: /empezar gratis/i }),
    ).toBeInTheDocument();
  });

  it('traduce la landing al cambiar de idioma', async () => {
    useSettingsStore.getState().setLanguage('en');
    render(<App />);
    expect(
      await screen.findByRole('link', { name: /start for free/i }),
    ).toBeInTheDocument();
  });
});
