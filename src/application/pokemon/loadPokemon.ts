import type { Pokemon } from '../../domain/pokemon/types';

export interface PokemonPage {
  readonly pokemon: readonly Pokemon[];
  readonly totalCount: number;
}

export type LoadPokemon = (signal: AbortSignal) => Promise<PokemonPage>;
