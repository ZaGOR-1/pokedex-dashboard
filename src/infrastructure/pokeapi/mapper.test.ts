import { describe, expect, it } from 'vitest';
import { apiList, apiPokemon } from '../../../tests/fixtures/pokeapi';
import { mapPokemon, parsePokemonList } from './mapper';

describe('PokeAPI mapper', () => {
  it('читає характеристики за назвою та типи за slot, не змінюючи DTO', () => {
    const dto = structuredClone(apiPokemon[0]);
    const before = structuredClone(dto);
    expect(mapPokemon(dto)).toEqual({
      id: 1,
      name: 'bulbasaur',
      types: ['grass', 'poison'],
      stats: { hp: 45, attack: 49, defense: 49 },
    });
    expect(dto).toEqual(before);
  });

  it('залишає відсутню характеристику як null, а не вигаданий нуль', () => {
    expect(
      mapPokemon({ ...apiPokemon[0], stats: [], types: [] }),
    ).toMatchObject({
      types: [],
      stats: { hp: null, attack: null, defense: null },
    });
  });

  it.each([
    null,
    { ...apiPokemon[0], id: '1' },
    { ...apiPokemon[0], stats: [{ base_stat: -1, stat: { name: 'hp' } }] },
    { ...apiPokemon[0], types: [{ slot: 1, type: { name: 'not a type' } }] },
    { ...apiPokemon[0], name: '../pokemon' },
  ])('відхиляє некоректний запис: %j', (dto) => {
    expect(() => mapPokemon(dto)).toThrow();
  });

  it.each(['stellar', 'future-type'])(
    'зберігає коректну назву типу поза стандартним списком: %s',
    (name) => {
      expect(
        mapPokemon({
          ...apiPokemon[0],
          types: [
            { slot: 2, type: { name } },
            { slot: 1, type: { name: 'grass' } },
          ],
        }).types,
      ).toEqual(['grass', name]);
    },
  );

  it.each(['', 'Fire', 'space type', '../type', 7, null])(
    'відхиляє некоректну назву типу: %j',
    (name) => {
      expect(() =>
        mapPokemon({ ...apiPokemon[0], types: [{ slot: 1, type: { name } }] }),
      ).toThrow('некоректні дані');
    },
  );

  it('читає загальну кількість і порожню сторінку', () => {
    expect(parsePokemonList(apiList)).toMatchObject({ count: 1350 });
    expect(parsePokemonList({ count: 0, results: [] })).toEqual({
      count: 0,
      results: [],
    });
  });

  it.each([
    null,
    { results: [] },
    { count: -1, results: [] },
    { count: 1, results: [{ name: '../../other' }] },
    { count: 0, results: [{ name: 'bulbasaur' }] },
  ])('відхиляє некоректний список: %j', (dto) => {
    expect(() => parsePokemonList(dto)).toThrow('некоректний список');
  });
});
