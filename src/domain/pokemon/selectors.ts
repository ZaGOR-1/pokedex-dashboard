import type {
  Pokemon,
  PokemonTypeFilter,
  PokemonSortField,
  SortDirection,
  PokemonFilters,
} from './types';

export function filterPokemonByType(
  pokemon: readonly Pokemon[],
  type: PokemonTypeFilter,
): Pokemon[] {
  return pokemon.filter((item) => type === 'all' || item.types.includes(type));
}

export function filterPokemon(
  pokemon: readonly Pokemon[],
  filters: PokemonFilters,
): Pokemon[] {
  const search = filters.search.trim().toLowerCase();
  return filterPokemonByType(pokemon, filters.type).filter(
    (item) =>
      item.name.toLowerCase().includes(search) &&
      (filters.minHp === null ||
        (item.stats.hp !== null && item.stats.hp >= filters.minHp)),
  );
}

export function getPokemonSummary(pokemon: readonly Pokemon[]) {
  return {
    total: pokemon.length,
    typeCount: new Set(pokemon.flatMap((item) => item.types)).size,
    multiTypeCount: pokemon.filter((item) => item.types.length > 1).length,
  };
}

export function sortPokemon(
  pokemon: readonly Pokemon[],
  field: PokemonSortField,
  direction: SortDirection,
): Pokemon[] {
  return [...pokemon].sort((first, second) => {
    const firstValue = field === 'hp' ? first.stats.hp : first[field];
    const secondValue = field === 'hp' ? second.stats.hp : second[field];

    // Відсутні характеристики залишаються в кінці за обох напрямків.
    if (firstValue === null)
      return secondValue === null ? first.id - second.id : 1;
    if (secondValue === null) return -1;

    const comparison =
      typeof firstValue === 'string' && typeof secondValue === 'string'
        ? firstValue.localeCompare(secondValue, 'en')
        : Number(firstValue) - Number(secondValue);
    return comparison === 0
      ? first.id - second.id
      : comparison * (direction === 'asc' ? 1 : -1);
  });
}
