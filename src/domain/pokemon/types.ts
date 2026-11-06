export const pokemonTypes = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export type PokemonType = string;
export type StandardPokemonType = (typeof pokemonTypes)[number];
export type PokemonTypeFilter = StandardPokemonType | 'all';

export interface PokemonFilters {
  readonly search: string;
  readonly type: PokemonTypeFilter;
  readonly minHp: number | null;
}

export interface Pokemon {
  readonly id: number;
  readonly name: string;
  readonly types: readonly PokemonType[];
  readonly stats: {
    readonly hp: number | null;
    readonly attack: number | null;
    readonly defense: number | null;
  };
}

export type PokemonSortField = 'id' | 'name' | 'hp';
export type SortDirection = 'asc' | 'desc';
