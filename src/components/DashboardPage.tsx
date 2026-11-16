import type { LoadPokemon } from '../application/pokemon/loadPokemon';
import { PokemonDashboard } from './PokemonDashboard';

export function DashboardPage({ loadPokemon }: { loadPokemon: LoadPokemon }) {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">ВАРІАНТ 06 · ЛАБОРАТОРНА РОБОТА 04</p>
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
          Досліджуй типи Pokémon, порівнюй характеристики та збирайся у свою
          першу подорож.
        </p>
      </section>
      <PokemonDashboard loadPokemon={loadPokemon} />
    </>
  );
}
