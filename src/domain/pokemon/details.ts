import type { Pokemon } from './types';

export interface PokemonDetails extends Pokemon {
  readonly spriteUrl: string | null;
  readonly abilities: readonly string[];
}

export interface EvolutionNode {
  readonly speciesName: string;
  readonly evolvesTo: readonly EvolutionNode[];
}
