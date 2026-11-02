import type { Pokemon } from '../../domain/pokemon/types';
import type { PokemonDto, PokemonListDto } from './dto';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isInteger(value: unknown, minimum = 0): value is number {
  return (
    typeof value === 'number' && Number.isInteger(value) && value >= minimum
  );
}

function isName(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9-]+$/.test(value);
}

function hasName(value: unknown): value is { name: string } {
  return isObject(value) && isName(value.name);
}

function isTypeDto(value: unknown): value is PokemonDto['types'][number] {
  return isObject(value) && isInteger(value.slot, 1) && hasName(value.type);
}

function isStatDto(value: unknown): value is PokemonDto['stats'][number] {
  return isObject(value) && isInteger(value.base_stat) && hasName(value.stat);
}

export function parsePokemonList(value: unknown): PokemonListDto {
  if (
    !isObject(value) ||
    !isInteger(value.count) ||
    !Array.isArray(value.results) ||
    !value.results.every(hasName) ||
    value.count < value.results.length
  ) {
    throw new Error('PokeAPI повернув некоректний список Pokémon.');
  }
  return { count: value.count, results: value.results };
}

function parsePokemon(value: unknown): PokemonDto {
  if (
    !isObject(value) ||
    !isInteger(value.id, 1) ||
    !isName(value.name) ||
    !Array.isArray(value.types) ||
    !value.types.every(isTypeDto) ||
    !Array.isArray(value.stats) ||
    !value.stats.every(isStatDto)
  ) {
    throw new Error('PokeAPI повернув некоректні дані Pokémon.');
  }
  return {
    id: value.id,
    name: value.name,
    types: value.types,
    stats: value.stats,
  };
}

export function mapPokemon(value: unknown): Pokemon {
  const dto = parsePokemon(value);
  const types = [...dto.types]
    .sort((first, second) => first.slot - second.slot)
    .map(({ type }) => type.name);
  const getStat = (name: string) =>
    dto.stats.find((item) => item.stat.name === name)?.base_stat ?? null;

  return {
    id: dto.id,
    name: dto.name,
    types,
    stats: {
      hp: getStat('hp'),
      attack: getStat('attack'),
      defense: getStat('defense'),
    },
  };
}
