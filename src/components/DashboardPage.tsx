import { Badge } from '../ui/atoms/Badge';
import type { LoadPokemon } from '../application/pokemon/loadPokemon';
import type { GetPokemonTypeCount } from '../application/pokemon/getPokemonTypeCount';
import { PokemonDashboard } from './PokemonDashboard';

interface DashboardPageProps {
  loadPokemon: LoadPokemon;
  getPokemonTypeCount: GetPokemonTypeCount;
}

export function DashboardPage({
  loadPokemon,
  getPokemonTypeCount,
}: DashboardPageProps) {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">ВАРІАНТ 06 · ЛАБОРАТОРНА РОБОТА 06</p>
        <div className="intro-heading">
          <h1 id="page-title">
            Кожна пригода починається
            <br className="desktop-break" /> з цікавості<span>.</span>
          </h1>
          <Badge tone="info" className="demo-label">
            <span aria-hidden="true" />
            Дані з PokeAPI
          </Badge>
        </div>
        <p className="intro-description">
          Досліджуй типи Pokémon, порівнюй характеристики та збирайся у свою
          першу подорож.
        </p>
      </section>
      <PokemonDashboard
        loadPokemon={loadPokemon}
        getPokemonTypeCount={getPokemonTypeCount}
      />
    </>
  );
}
