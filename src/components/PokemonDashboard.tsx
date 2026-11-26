import { useDashboardStore } from '../app/dashboardStore';
import { selectFilters } from '../app/dashboardSelectors';
import type { LoadPokemon } from '../application/pokemon/loadPokemon';
import type { GetPokemonTypeCount } from '../application/pokemon/getPokemonTypeCount';
import { filterPokemon } from '../domain/pokemon/selectors';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { PokemonDashboardView } from './PokemonDashboardView';

interface PokemonDashboardProps {
  loadPokemon: LoadPokemon;
  getPokemonTypeCount: GetPokemonTypeCount;
}

export function PokemonDashboard({
  loadPokemon,
  getPokemonTypeCount,
}: PokemonDashboardProps) {
  const { data, loading, error, refetch } = useFetch(loadPokemon, undefined);
  const { search, type, minHp } = useDashboardStore(selectFilters);
  // Порожній пошук одразу замінює останню застосовану назву.
  const debouncedSearch = useDebounce(search, 400, search === '');
  const pokemon = filterPokemon(data?.pokemon ?? [], {
    search: debouncedSearch,
    type,
    minHp: minHp === '' ? null : Number(minHp),
  });

  return (
    <PokemonDashboardView
      pokemon={pokemon}
      selectedType={type}
      getPokemonTypeCount={getPokemonTypeCount}
      totalCount={data?.totalCount ?? null}
      loadedCount={data?.pokemon.length ?? 0}
      loading={loading}
      error={error}
      onRetry={refetch}
    />
  );
}
