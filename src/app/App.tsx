import type { LoadPokemon } from '../application/pokemon/loadPokemon';
import { Route, Routes } from 'react-router';
import {
  createGetPokemonDetails,
  type GetPokemonDetails,
} from '../application/pokemon/getPokemonDetails';
import { DashboardPage } from '../components/DashboardPage';
import { PokemonDetailsPage } from '../components/PokemonDetailsPage';
import { NotFoundPage } from '../components/NotFoundPage';
import { ThemeRoot } from './ThemeRoot';
import { RouteFocus } from './RouteFocus';
import { ThemeToggle } from '../components/ThemeToggle';
import { createPokeApiClient } from '../infrastructure/pokeapi/PokeApiClient';

const pokeApi = createPokeApiClient();
const defaultGetDetails = createGetPokemonDetails(pokeApi.detailsRepository);

interface AppProps {
  loadPokemon?: LoadPokemon;
  getPokemonDetails?: GetPokemonDetails;
}

export function App({
  loadPokemon = pokeApi.loadPokemon,
  getPokemonDetails = defaultGetDetails,
}: AppProps) {
  return (
    <ThemeRoot>
      <RouteFocus />
      <a className="skip-link" href="#main-content">
        Перейти до вмісту
      </a>
      <ThemeToggle />
      <div className="page">
        <header className="page-header">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <div>
              <span className="brand-name">Pokédex</span>
              <span className="brand-caption">ANALYTICS</span>
            </div>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <Routes>
            <Route
              path="/"
              element={<DashboardPage loadPokemon={loadPokemon} />}
            />
            <Route
              path="/pokemon/:id"
              element={
                <PokemonDetailsPage getPokemonDetails={getPokemonDetails} />
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <footer className="page-footer">
          <span>Pokédex Analytics · Навчальний проєкт</span>
          <span>
            Pokémon належать їхнім правовласникам ·{' '}
            <a href="https://pokeapi.co/docs/v2">PokeAPI</a>
          </span>
        </footer>
      </div>
    </ThemeRoot>
  );
}
