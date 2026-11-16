import { apiPokemon } from './pokeapi';

export const apiDetails = {
  ...apiPokemon[0],
  id: 133,
  name: 'eevee',
  types: [{ slot: 1, type: { name: 'normal' } }],
  sprites: {
    front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png',
  },
  abilities: [
    { ability: { name: 'run-away' }, is_hidden: false, slot: 1 },
    { ability: { name: 'adaptability' }, is_hidden: false, slot: 2 },
  ],
  species: {
    name: 'eevee',
    url: 'https://pokeapi.co/api/v2/pokemon-species/133/',
  },
  stats: [
    { base_stat: 65, stat: { name: 'speed' } },
    { base_stat: 55, stat: { name: 'hp' } },
    { base_stat: 55, stat: { name: 'attack' } },
    { base_stat: 50, stat: { name: 'defense' } },
    { base_stat: 45, stat: { name: 'special-attack' } },
    { base_stat: 65, stat: { name: 'special-defense' } },
  ],
};

export const apiSpecies = {
  evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/67/' },
};
export const eeveeEvolutions = [
  'vaporeon',
  'jolteon',
  'flareon',
  'espeon',
  'umbreon',
  'leafeon',
  'glaceon',
  'sylveon',
];
export const apiEvolution = {
  chain: {
    species: { name: 'eevee' },
    evolves_to: eeveeEvolutions.map((name) => ({
      species: { name },
      evolves_to: [],
    })),
  },
};
