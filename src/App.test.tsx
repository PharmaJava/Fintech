import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('App', () => {
  it('muestra el titulo de la aplicacion', () => {
    render(<App />);
    expect(screen.getByText('Patrimonio')).toBeInTheDocument();
  });
});
