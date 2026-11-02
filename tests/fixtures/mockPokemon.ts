import type { Pokemon } from '../../src/domain/pokemon/types';

export const mockPokemon: readonly Pokemon[] = [
  {
    id: 1,
    name: 'Bulbasaur',
    types: ['grass', 'poison'],
    stats: { hp: 45, attack: 49, defense: 49 },
  },
  {
    id: 2,
    name: 'Ivysaur',
    types: ['grass', 'poison'],
    stats: { hp: 60, attack: 62, defense: 63 },
  },
  {
    id: 4,
    name: 'Charmander',
    types: ['fire'],
    stats: { hp: 39, attack: 52, defense: 43 },
  },
  {
    id: 5,
    name: 'Charmeleon',
    types: ['fire'],
    stats: { hp: 58, attack: 64, defense: 58 },
  },
  {
    id: 7,
    name: 'Squirtle',
    types: ['water'],
    stats: { hp: 44, attack: 48, defense: 65 },
  },
  {
    id: 8,
    name: 'Wartortle',
    types: ['water'],
    stats: { hp: 59, attack: 63, defense: 80 },
  },
  {
    id: 10,
    name: 'Caterpie',
    types: ['bug'],
    stats: { hp: 45, attack: 30, defense: 35 },
  },
  {
    id: 16,
    name: 'Pidgey',
    types: ['normal', 'flying'],
    stats: { hp: 40, attack: 45, defense: 40 },
  },
  {
    id: 25,
    name: 'Pikachu',
    types: ['electric'],
    stats: { hp: 35, attack: 55, defense: 40 },
  },
  {
    id: 27,
    name: 'Sandshrew',
    types: ['ground'],
    stats: { hp: 50, attack: 75, defense: 85 },
  },
  {
    id: 39,
    name: 'Jigglypuff',
    types: ['normal', 'fairy'],
    stats: { hp: 115, attack: 45, defense: 20 },
  },
  {
    id: 133,
    name: 'Eevee',
    types: ['normal'],
    stats: { hp: 55, attack: 55, defense: 50 },
  },
];
