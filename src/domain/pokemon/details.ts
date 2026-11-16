import type { Pokemon } from './types';

export interface PokemonDetails extends Pokemon {
  readonly spriteUrl: string | null;
  readonly abilities: readonly string[];
  readonly stats: Pokemon['stats'] & {
    readonly specialAttack: number | null;
    readonly specialDefense: number | null;
    readonly speed: number | null;
  };
}

export interface EvolutionNode {
  readonly speciesName: string;
  readonly evolvesTo: readonly EvolutionNode[];
}
