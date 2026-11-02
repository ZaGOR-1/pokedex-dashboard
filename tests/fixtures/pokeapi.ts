export const apiList = {
  count: 1350,
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
    { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' },
  ],
};

export const apiPokemon = [
  {
    id: 1,
    name: 'bulbasaur',
    types: [
      { slot: 2, type: { name: 'poison' } },
      { slot: 1, type: { name: 'grass' } },
    ],
    stats: [
      { base_stat: 49, stat: { name: 'defense' } },
      { base_stat: 45, stat: { name: 'hp' } },
      { base_stat: 49, stat: { name: 'attack' } },
    ],
  },
  {
    id: 4,
    name: 'charmander',
    types: [{ slot: 1, type: { name: 'fire' } }],
    stats: [
      { base_stat: 39, stat: { name: 'hp' } },
      { base_stat: 52, stat: { name: 'attack' } },
      { base_stat: 43, stat: { name: 'defense' } },
    ],
  },
  {
    id: 7,
    name: 'squirtle',
    types: [{ slot: 1, type: { name: 'water' } }],
    stats: [
      { base_stat: 44, stat: { name: 'hp' } },
      { base_stat: 48, stat: { name: 'attack' } },
      { base_stat: 65, stat: { name: 'defense' } },
    ],
  },
];
