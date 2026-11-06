import { useForm, useWatch } from 'react-hook-form';
import type { LoadPokemon } from '../application/pokemon/loadPokemon';
import { filterPokemon } from '../domain/pokemon/selectors';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import type { PokemonFilterValues } from './PokemonFilterForm';
import { PokemonDashboardView } from './PokemonDashboardView';

interface PokemonDashboardProps {
  loadPokemon: LoadPokemon;
}

export function PokemonDashboard({ loadPokemon }: PokemonDashboardProps) {
  const { data, loading, error, refetch } = useFetch(loadPokemon, undefined);
  const { control, reset } = useForm<PokemonFilterValues>({
    defaultValues: { search: '', type: 'all', minHp: '' },
  });
  const [search, type, minHp] = useWatch({
    control,
    name: ['search', 'type', 'minHp'],
  });
  const debouncedSearch = useDebounce(search, 400);
  // Після скидання порожній пошук застосовується одразу.
  const pokemon = filterPokemon(data?.pokemon ?? [], {
    search: search === '' ? '' : debouncedSearch,
    type,
    minHp: minHp === '' ? null : Number(minHp),
  });

  return (
    <PokemonDashboardView
      pokemon={pokemon}
      totalCount={data?.totalCount ?? null}
      loadedCount={data?.pokemon.length ?? 0}
      loading={loading}
      error={error}
      onRetry={refetch}
      control={control}
      onReset={() => reset()}
      canReset={search !== '' || type !== 'all' || minHp !== ''}
    />
  );
}
