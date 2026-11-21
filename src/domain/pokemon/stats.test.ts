import { describe, expect, it } from 'vitest';
import { mockPokemon } from '../../../tests/fixtures/mockPokemon';
import type { BaseStats, Pokemon } from './types';
import { getAverageStats, statKeys } from './stats';

const pokemonWithStats = (stats: Partial<BaseStats>): Pokemon => ({
  ...mockPokemon[0]!,
  stats: {
    hp: null,
    attack: null,
    defense: null,
    specialAttack: null,
    specialDefense: null,
    speed: null,
    ...stats,
  },
});

describe('Середні базові характеристики', () => {
  it('рахує шість середніх у сталому порядку без округлення', () => {
    const data = [1, 2, 7].map((value) =>
      pokemonWithStats({
        hp: value,
        attack: value * 2,
        defense: value * 3,
        specialAttack: value * 4,
        specialDefense: value * 5,
        speed: value * 6,
      }),
    );
    expect(getAverageStats(data)).toEqual(
      statKeys.map((stat, index) => ({
        stat,
        value: (10 * (index + 1)) / 3,
        count: 3,
      })),
    );
  });

  it('відрізняє нулі від null і рахує окремий знаменник', () => {
    const data = [
      pokemonWithStats({ hp: 0, attack: 30 }),
      pokemonWithStats({ hp: 10, speed: 0 }),
      pokemonWithStats({ hp: null, attack: 10, speed: 20 }),
    ];
    expect(getAverageStats(data)).toEqual([
      { stat: 'hp', value: 5, count: 2 },
      { stat: 'attack', value: 20, count: 2 },
      { stat: 'defense', value: null, count: 0 },
      { stat: 'specialAttack', value: null, count: 0 },
      { stat: 'specialDefense', value: null, count: 0 },
      { stat: 'speed', value: 10, count: 2 },
    ]);
  });

  it('підтримує порожню вибірку', () => {
    expect(getAverageStats([])).toEqual(
      statKeys.map((stat) => ({ stat, value: null, count: 0 })),
    );
  });

  it('не змінює навіть заморожені дані й не включає відсутнє значення', () => {
    const item = pokemonWithStats({ hp: 0 });
    Reflect.deleteProperty(item.stats, 'speed');
    Object.freeze(item.stats);
    Object.freeze(item);
    const data = Object.freeze([item]);
    const before = structuredClone(data);
    const result = getAverageStats(data);
    expect(data).toEqual(before);
    expect(result.find(({ stat }) => stat === 'speed')).toEqual({
      stat: 'speed',
      value: null,
      count: 0,
    });
    expect(result[0]).toEqual({ stat: 'hp', value: 0, count: 1 });
  });
});
