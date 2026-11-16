import type { ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { PokemonFiltersProvider } from '../src/app/PokemonFiltersProvider';

function Providers({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <PokemonFiltersProvider>{children}</PokemonFiltersProvider>
    </MemoryRouter>
  );
}

export function renderWithProviders(ui: ReactNode, options?: RenderOptions) {
  return render(ui, { wrapper: Providers, ...options });
}
