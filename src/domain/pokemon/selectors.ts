import type { Pokemon, PokemonTypeFilter } from './types';

export function filterPokemonByType(
  pokemon: readonly Pokemon[],
  type: PokemonTypeFilter,
): Pokemon[] {
  return pokemon.filter((item) => type === 'all' || item.types.includes(type));
}

export function getPokemonSummary(pokemon: readonly Pokemon[]) {
  return {
    total: pokemon.length,
    typeCount: new Set(pokemon.flatMap((item) => item.types)).size,
    multiTypeCount: pokemon.filter((item) => item.types.length > 1).length,
  };
}
