import type { StandardPokemonType } from '../../domain/pokemon/types';

export type GetPokemonTypeCount = (
  signal: AbortSignal,
  type: StandardPokemonType,
) => Promise<number>;
