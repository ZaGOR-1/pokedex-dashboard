// Лише поля відповіді, потрібні для поточної таблиці.
export interface PokemonListDto {
  count: number;
  results: { name: string }[];
}

export interface PokemonDto {
  id: number;
  name: string;
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}
