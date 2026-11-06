import { describe, expect, it } from 'vitest';
import {
  filterPokemonByType,
  filterPokemon,
  getPokemonSummary,
  sortPokemon,
} from './selectors';
import { mockPokemon } from '../../../tests/fixtures/mockPokemon';

const pokemon = Object.freeze(
  mockPokemon.filter((item) => [1, 4, 7].includes(item.id)),
);

describe('filterPokemon', () => {
  const defaults = { search: '', type: 'all', minHp: null } as const;

  it('шукає частину назви без урахування регістру й пробілів навколо', () => {
    expect(filterPokemon(pokemon, { ...defaults, search: ' BULBA ' })).toEqual([
      pokemon[0],
    ]);
  });

  it('поєднує назву, другий тип та включну нижню межу HP', () => {
    expect(
      filterPokemon(mockPokemon, { search: 'saur', type: 'poison', minHp: 60 }),
    ).toEqual([mockPokemon[1]]);
    expect(
      filterPokemon(mockPokemon, { search: 'saur', type: 'poison', minHp: 61 }),
    ).toEqual([]);
  });

  it('відсутній HP залишає без порога та відсіює з порогом 0', () => {
    const missing = {
      ...pokemon[0]!,
      stats: { hp: null, attack: null, defense: null },
    };
    expect(filterPokemon([missing], defaults)).toEqual([missing]);
    expect(filterPokemon([missing], { ...defaults, minHp: 0 })).toEqual([]);
  });

  it('повертає порожній масив без збігів і для порожнього джерела', () => {
    expect(filterPokemon(pokemon, { ...defaults, search: 'missing' })).toEqual(
      [],
    );
    expect(filterPokemon([], defaults)).toEqual([]);
  });

  it('не змінює джерело; KPI рахуються з відфільтрованих записів', () => {
    const before = structuredClone(pokemon);
    const filtered = filterPokemon(pokemon, { ...defaults, type: 'grass' });
    expect(getPokemonSummary(filtered)).toEqual({
      total: 1,
      typeCount: 2,
      multiTypeCount: 1,
    });
    expect(pokemon).toEqual(before);
    expect(filterPokemon(pokemon, defaults)).not.toBe(pokemon);
  });
});

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
