import { useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  parsePokemonId,
  type GetPokemonDetails,
} from '../application/pokemon/getPokemonDetails';
import type { EvolutionNode } from '../domain/pokemon/details';
import { useFetch } from '../hooks/useFetch';
import { statLabels } from './pokemonStatLabels';
import { FavoriteButton } from './FavoriteButton';

function PokemonImage({ url, name }: { url: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  return url && !failed ? (
    <img
      src={url}
      alt={name}
      width="160"
      height="160"
      onError={() => setFailed(true)}
    />
  ) : (
    <p className="muted">Зображення недоступне.</p>
  );
}

function EvolutionTree({ node }: { node: EvolutionNode }) {
  return (
    <li>
      <span lang="en">{node.speciesName}</span>
      {node.evolvesTo.length > 0 && (
        <ul>
          {node.evolvesTo.map((child) => (
            <EvolutionTree key={child.speciesName} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

function PokemonDetails({
  id,
  getPokemonDetails,
}: {
  id: number;
  getPokemonDetails: GetPokemonDetails;
}) {
  const { data, loading, error, refetch } = useFetch(getPokemonDetails, id);

  if (loading)
    return (
      <section className="panel empty-state" role="status">
        <h1>Завантаження деталей Pokémon…</h1>
      </section>
    );
  if (error)
    return (
      <section className="panel empty-state" role="alert">
        <h1>Не вдалося завантажити деталі</h1>
        <p>{error}</p>
        <button className="secondary-button" type="button" onClick={refetch}>
          Повторити запит
        </button>
      </section>
    );
  if (!data)
    return (
      <section className="panel empty-state" role="status">
        <h1>Pokémon не знайдено</h1>
        <p>Запис із ID {id} відсутній у PokeAPI.</p>
      </section>
    );

  const { pokemon, evolution, evolutionError } = data;
  return (
    <article className="panel details-panel" aria-labelledby="pokemon-title">
      <header className="details-heading">
        <div>
          <p className="eyebrow">POKÉMON #{pokemon.id}</p>
          <h1 id="pokemon-title" lang="en">
            {pokemon.name}
          </h1>
          <FavoriteButton pokemonId={pokemon.id} pokemonName={pokemon.name} />
          <ul className="type-list" aria-label="Типи Pokémon">
            {pokemon.types.map((type) => (
              <li key={type} className={`type-badge type-${type}`} lang="en">
                {type}
              </li>
            ))}
          </ul>
          {pokemon.types.length === 0 && <p>Типи невідомі.</p>}
        </div>
        <PokemonImage
          key={pokemon.spriteUrl}
          url={pokemon.spriteUrl}
          name={pokemon.name}
        />
      </header>
      <section aria-labelledby="stats-title">
        <h2 id="stats-title">Базові характеристики</h2>
        <dl className="stats-grid">
          {Object.entries(statLabels).map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>
                {pokemon.stats[key as keyof typeof statLabels] ?? 'Невідомо'}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section aria-labelledby="abilities-title">
        <h2 id="abilities-title">Здібності</h2>
        {pokemon.abilities.length === 0 ? (
          <p>Здібності невідомі.</p>
        ) : (
          <ul className="abilities-list">
            {pokemon.abilities.map((ability) => (
              <li key={ability} lang="en">
                {ability}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="evolution-title">
        <h2 id="evolution-title">Еволюції</h2>
        {evolutionError ? (
          <p role="alert">
            Не вдалося завантажити еволюції: {evolutionError} Поверніться до
            списку та відкрийте деталі ще раз.
          </p>
        ) : evolution ? (
          <>
            <p className="muted">
              Гілки показують можливі еволюції видів. Умови переходів тут не
              наведено.
            </p>
            <ul className="evolution-tree">
              <EvolutionTree node={evolution} />
            </ul>
          </>
        ) : (
          <p>Інформація про ланцюжок еволюцій недоступна.</p>
        )}
      </section>
    </article>
  );
}

export function PokemonDetailsPage({
  getPokemonDetails,
}: {
  getPokemonDetails: GetPokemonDetails;
}) {
  const { id: routeId } = useParams();
  const id = parsePokemonId(routeId);
  return (
    <div className="details-page">
      <Link className="back-link" to="/">
        ← Назад до дашборду
      </Link>
      {id === null ? (
        <section className="panel empty-state" role="status">
          <h1>Некоректний ID Pokémon</h1>
          <p>
            Укажіть додатне ціле число без початкових нулів, наприклад
            /pokemon/25.
          </p>
        </section>
      ) : (
        <PokemonDetails id={id} getPokemonDetails={getPokemonDetails} />
      )}
    </div>
  );
}
