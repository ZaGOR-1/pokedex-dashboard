import { Button } from '../ui/atoms/Button';
import { Card } from '../ui/molecules/Card';
import { StatusMessage } from '../ui/molecules/StatusMessage';
import { PokemonTypeList } from './PokemonTypeList';
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
    <img src={url} alt={name} onError={() => setFailed(true)} />
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
      <StatusMessage
        variant="loading"
        headingLevel="h1"
        heading="Завантаження деталей Pokémon…"
      />
    );
  if (error)
    return (
      <StatusMessage
        variant="error"
        headingLevel="h1"
        heading="Не вдалося завантажити деталі"
      >
        <p>{error}</p>
        <Button onClick={refetch}>Повторити запит</Button>
      </StatusMessage>
    );
  if (!data)
    return (
      <StatusMessage
        variant="empty"
        headingLevel="h1"
        heading="Pokémon не знайдено"
      >
        <p>Запис із ID {id} відсутній у PokeAPI.</p>
      </StatusMessage>
    );

  const { pokemon, evolution, evolutionError } = data;
  return (
    <Card
      as="article"
      className="details-panel"
      aria-labelledby="pokemon-title"
    >
      <header className="details-heading">
        <div>
          <p className="eyebrow">POKÉMON #{pokemon.id}</p>
          <h1 id="pokemon-title" lang="en">
            {pokemon.name}
          </h1>
          <FavoriteButton pokemonId={pokemon.id} pokemonName={pokemon.name} />
          {pokemon.types.length > 0 ? (
            <PokemonTypeList types={pokemon.types} label="Типи Pokémon" />
          ) : (
            <p>Типи невідомі.</p>
          )}
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
    </Card>
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
        <StatusMessage
          variant="empty"
          headingLevel="h1"
          heading="Некоректний ID Pokémon"
        >
          <p>
            Укажіть додатне ціле число без початкових нулів, наприклад
            /pokemon/25.
          </p>
        </StatusMessage>
      ) : (
        <PokemonDetails id={id} getPokemonDetails={getPokemonDetails} />
      )}
    </div>
  );
}
