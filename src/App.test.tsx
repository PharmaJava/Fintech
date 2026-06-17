import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('App', () => {
  it('arranca bloqueada y muestra la pantalla de PIN', async () => {
    render(<App />);
    // Estado inicial: marca de la app visible.
    expect(screen.getByText('Patrimonio')).toBeInTheDocument();
    // El campo de PIN aparece en cualquier estado (crear/introducir).
    expect(await screen.findByPlaceholderText(/PIN/i)).toBeInTheDocument();
  });
});
