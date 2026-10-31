import type { Pokemon } from '../domain/pokemon/types';

export const mockPokemon: readonly Pokemon[] = [
  { id: 1, name: 'Bulbasaur', types: ['grass', 'poison'] },
  { id: 2, name: 'Ivysaur', types: ['grass', 'poison'] },
  { id: 4, name: 'Charmander', types: ['fire'] },
  { id: 5, name: 'Charmeleon', types: ['fire'] },
  { id: 7, name: 'Squirtle', types: ['water'] },
  { id: 8, name: 'Wartortle', types: ['water'] },
  { id: 10, name: 'Caterpie', types: ['bug'] },
  { id: 16, name: 'Pidgey', types: ['normal', 'flying'] },
  { id: 25, name: 'Pikachu', types: ['electric'] },
  { id: 27, name: 'Sandshrew', types: ['ground'] },
  { id: 39, name: 'Jigglypuff', types: ['normal', 'fairy'] },
  { id: 133, name: 'Eevee', types: ['normal'] },
];
