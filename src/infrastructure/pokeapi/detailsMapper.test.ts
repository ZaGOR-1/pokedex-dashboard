import { describe, expect, it } from 'vitest';
import {
  apiDetails,
  apiEvolution,
  eeveeEvolutions,
} from '../../../tests/fixtures/details';
import {
  mapEvolutionChain,
  mapEvolutionChainId,
  mapPokemonDetails,
  resourceId,
} from './detailsMapper';

describe('Деталі PokeAPI', () => {
  it('читає всі шість stats за назвами, здібності й species окремо від ID форми', () => {
    const dto = { ...apiDetails, id: 10102 };
    const before = structuredClone(dto);
    const details = mapPokemonDetails(dto);
    expect(details).toMatchObject({
      speciesId: 133,
      pokemon: {
        id: 10102,
        stats: {
          hp: 55,
          attack: 55,
          defense: 50,
          specialAttack: 45,
          specialDefense: 65,
          speed: 65,
        },
        abilities: ['run-away', 'adaptability'],
        spriteUrl: apiDetails.sprites.front_default,
      },
    });
    expect(dto).toEqual(before);
  });

  it('залишає відсутні stats, зображення та здібності порожніми', () => {
    expect(
      mapPokemonDetails({
        ...apiDetails,
        stats: [],
        sprites: null,
        abilities: [],
      }).pokemon,
    ).toMatchObject({
      spriteUrl: null,
      abilities: [],
      stats: { hp: null, speed: null },
    });
    expect(
      mapPokemonDetails({
        ...apiDetails,
        sprites: { front_default: 'javascript:alert(1)' },
      }).pokemon.spriteUrl,
    ).toBeNull();
  });

  it.each([
    null,
    { ...apiDetails, species: null },
    { ...apiDetails, abilities: [{}] },
  ])('відхиляє некоректні деталі', (value) => {
    expect(() => mapPokemonDetails(value)).toThrow();
  });

  it('зберігає всі вісім гілок Eevee й вкладені етапи', () => {
    expect(
      mapEvolutionChain(apiEvolution).evolvesTo.map((node) => node.speciesName),
    ).toEqual(eeveeEvolutions);
    expect(
      mapEvolutionChain({
        chain: {
          species: { name: 'bulbasaur' },
          evolves_to: [
            {
              species: { name: 'ivysaur' },
              evolves_to: [{ species: { name: 'venusaur' }, evolves_to: [] }],
            },
          ],
        },
      }).evolvesTo[0]?.evolvesTo[0]?.speciesName,
    ).toBe('venusaur');
  });

  it.each([
    null,
    { chain: {} },
    { chain: { species: { name: 'eevee' }, evolves_to: [null] } },
  ])('відхиляє зіпсований ланцюжок', (value) => {
    expect(() => mapEvolutionChain(value)).toThrow();
  });

  it('розрізняє відсутній ланцюжок і некоректну відповідь', () => {
    expect(mapEvolutionChainId({ evolution_chain: null })).toBeNull();
    expect(() => mapEvolutionChainId({})).toThrow();
  });

  it.each([
    'https://example.org/api/v2/evolution-chain/67/',
    'https://pokeapi.co.evil.org/api/v2/evolution-chain/67/',
    'http://pokeapi.co/api/v2/evolution-chain/67/',
    'https://pokeapi.co/api/v2/pokemon/67/',
    'https://pokeapi.co/api/v2/evolution-chain/67/?next=evil',
    'https://pokeapi.co/api/v2/evolution-chain/9007199254740992/',
  ])('не приймає стороннє або некоректне посилання %s', (url) => {
    expect(() => resourceId(url, 'evolution-chain')).toThrow();
  });
});
