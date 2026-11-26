import type { GetPokemonTypeCount } from '../application/pokemon/getPokemonTypeCount';
import { countPokemonByType } from '../domain/pokemon/selectors';
import type { Pokemon, StandardPokemonType } from '../domain/pokemon/types';
import { useFetch } from '../hooks/useFetch';
import { Badge } from '../ui/atoms/Badge';
import { Button } from '../ui/atoms/Button';
import { Card } from '../ui/molecules/Card';
import { StatusMessage } from '../ui/molecules/StatusMessage';
import { KpiCard } from './KpiCard';

export function PokemonTypeDistribution({
  pokemon,
}: {
  pokemon: readonly Pokemon[];
}) {
  const counts = countPokemonByType(pokemon);

  return (
    <Card
      as="article"
      className="type-stats"
      aria-label="Розподіл Pokémon за типами у вибірці"
    >
      <h3>Розподіл Pokémon за типами у вибірці</h3>
      {counts.length > 0 ? (
        <ul className="type-counts" role="list">
          {counts.map(({ type, count }) => (
            <li key={type}>
              <Badge>
                <span lang="en">{type}</span> · {count}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">У вибірці немає даних про типи.</p>
      )}
    </Card>
  );
}

export function PokemonTypeTotal({
  type,
  getPokemonTypeCount,
}: {
  type: StandardPokemonType;
  getPokemonTypeCount: GetPokemonTypeCount;
}) {
  const { data, loading, error, refetch } = useFetch(getPokemonTypeCount, type);

  return (
    <div className="type-stats">
      {loading ? (
        <StatusMessage
          headingLevel="h3"
          heading={`Завантаження статистики типу ${type}…`}
          variant="loading"
        />
      ) : error !== null ? (
        <StatusMessage
          headingLevel="h3"
          heading={`Не вдалося завантажити статистику типу ${type}`}
          variant="error"
        >
          <p className="muted">{error}</p>
          <Button onClick={refetch}>Повторити запит статистики</Button>
        </StatusMessage>
      ) : (
        <KpiCard
          title={`Записів типу ${type} в усій базі PokeAPI`}
          value={data ?? '—'}
          description="Записи Pokémon, включно з формами"
        />
      )}
    </div>
  );
}
