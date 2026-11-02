import { describe, expect, it } from 'vitest';
import {
  filterPokemonByType,
  getPokemonSummary,
  sortPokemon,
} from './selectors';
import { mockPokemon } from '../../../tests/fixtures/mockPokemon';

const pokemon = Object.freeze(
  mockPokemon.filter((item) => [1, 4, 7].includes(item.id)),
);

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

describe('sortPokemon', () => {
  const source = Object.freeze([
    mockPokemon[4]!,
    mockPokemon[0]!,
    mockPokemon[2]!,
  ]);

  it.each([
    ['name', 'asc', [1, 4, 7]],
    ['name', 'desc', [7, 4, 1]],
    ['hp', 'asc', [4, 7, 1]],
    ['hp', 'desc', [1, 7, 4]],
    ['id', 'asc', [1, 4, 7]],
    ['id', 'desc', [7, 4, 1]],
  ] as const)(
    'сортує %s у напрямку %s без мутації',
    (field, direction, expected) => {
      const before = structuredClone(source);
      const sorted = sortPokemon(source, field, direction);
      expect(sorted.map((item) => item.id)).toEqual(expected);
      expect(source).toEqual(before);
      expect(sorted).not.toBe(source);
    },
  );

  it.each(['asc', 'desc'] as const)(
    'відсутній HP залишає в кінці: %s; однакові значення впорядковує за ID',
    (direction) => {
      const missing = {
        ...mockPokemon[0]!,
        stats: { hp: null, attack: null, defense: null },
      };
      const sameHp = { ...mockPokemon[2]!, id: 99 };
      expect(
        sortPokemon([missing, sameHp, mockPokemon[2]!], 'hp', direction).map(
          (item) => item.id,
        ),
      ).toEqual([4, 99, 1]);
    },
  );

  it('підтримує порожній масив', () => {
    expect(sortPokemon([], 'hp', 'asc')).toEqual([]);
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
    expect(getPokemonSummary([...pokemon, mockPokemon[1]!])).toEqual({
      total: 4,
      typeCount: 4,
      multiTypeCount: 2,
    });
  });

  it('повертає нулі для порожньої вибірки', () => {
    expect(getPokemonSummary([])).toEqual({
      total: 0,
      typeCount: 0,
      multiTypeCount: 0,
    });
  });
});
