import type { LoadPokemon } from '../application/pokemon/loadPokemon';
import { PokemonDashboard } from '../components/PokemonDashboard';
import { ThemeToggle } from '../components/ThemeToggle';
import { createPokeApiClient } from '../infrastructure/pokeapi/PokeApiClient';

const pokeApi = createPokeApiClient();

interface AppProps {
  loadPokemon?: LoadPokemon;
}

export function App({ loadPokemon = pokeApi.loadPokemon }: AppProps) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти до вмісту
      </a>
      <ThemeToggle>
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
            <section className="intro" aria-labelledby="page-title">
              <p className="eyebrow">ВАРІАНТ 06 · ЛАБОРАТОРНА РОБОТА 02</p>
              <div className="intro-heading">
                <h1 id="page-title">
                  Кожна пригода починається
                  <br className="desktop-break" /> з цікавості<span>.</span>
                </h1>
                <span className="demo-label">
                  <span aria-hidden="true" />
                  Дані з PokeAPI
                </span>
              </div>
              <p className="intro-description">
                Досліджуй типи Pokémon, порівнюй характеристики та збирайся у
                свою першу подорож.
              </p>
            </section>
            <PokemonDashboard loadPokemon={loadPokemon} />
          </main>
          <footer className="page-footer">
            <span>Pokédex Analytics · Навчальний проєкт</span>
            <span>
              Pokémon належать їхнім правовласникам ·{' '}
              <a href="https://pokeapi.co/docs/v2">PokeAPI</a>
            </span>
          </footer>
        </div>
      </ThemeToggle>
    </>
  );
}
