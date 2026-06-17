import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('App', () => {
  it('muestra la landing pública en la raíz', async () => {
    render(<App />);
    expect(
      await screen.findByRole('link', { name: /empezar gratis/i }),
    ).toBeInTheDocument();
  });
});
