import { describe, expect, it } from 'vitest';
import { filterPokemonByType, getPokemonSummary } from './selectors';
import type { Pokemon } from './types';

const pokemon: readonly Pokemon[] = Object.freeze([
  { id: 1, name: 'Bulbasaur', types: ['grass', 'poison'] },
  { id: 4, name: 'Charmander', types: ['fire'] },
  { id: 7, name: 'Squirtle', types: ['water'] },
]);

describe('filterPokemonByType', () => {
  it('повертає всі записи для all', () => {
    expect(filterPokemonByType(pokemon, 'all')).toEqual(pokemon);
  });

  it('знаходить Pokémon за кожним із двох типів', () => {
    expect(
      filterPokemonByType(pokemon, 'grass').map((item) => item.id),
    ).toEqual([1]);
    expect(
      filterPokemonByType(pokemon, 'poison').map((item) => item.id),
    ).toEqual([1]);
  });

  it('повертає порожній масив без збігів і для порожніх даних', () => {
    expect(filterPokemonByType(pokemon, 'ice')).toEqual([]);
    expect(filterPokemonByType([], 'all')).toEqual([]);
  });

  it('не змінює початковий масив і зберігає порядок записів', () => {
    const before = structuredClone(pokemon);
    filterPokemonByType(pokemon, 'fire');
    getPokemonSummary(pokemon);
    expect(pokemon).toEqual(before);
    expect(filterPokemonByType(pokemon, 'all')).not.toBe(pokemon);
  });
});

describe('getPokemonSummary', () => {
  it('рахує записи, унікальні типи й записи з кількома типами', () => {
    expect(getPokemonSummary(pokemon)).toEqual({
      total: 3,
      typeCount: 4,
      multiTypeCount: 1,
    });
  });

  it('не рахує однаковий тип двічі для різних Pokémon', () => {
    expect(
      getPokemonSummary([
        ...pokemon,
        { id: 2, name: 'Ivysaur', types: ['grass', 'poison'] },
      ]),
    ).toEqual({ total: 4, typeCount: 4, multiTypeCount: 2 });
  });

  it('повертає нулі для порожньої вибірки', () => {
    expect(getPokemonSummary([])).toEqual({
      total: 0,
      typeCount: 0,
      multiTypeCount: 0,
    });
  });
});
