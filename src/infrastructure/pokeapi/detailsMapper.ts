import type { EvolutionNode } from '../../domain/pokemon/details';
import { isName, isObject, mapPokemon, parsePokemon } from './mapper';

export function resourceId(
  value: unknown,
  resource: 'pokemon-species' | 'evolution-chain',
): number {
  if (typeof value !== 'string') {
    throw new Error('PokeAPI повернув некоректне посилання на ресурс.');
  }
  const match = value.match(
    new RegExp(`^https://pokeapi\\.co/api/v2/${resource}/([1-9]\\d*)/$`),
  );
  const id = Number(match?.[1]);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error('PokeAPI повернув некоректне посилання на ресурс.');
  }
  return id;
}

function spriteUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    // Некоректне необов’язкове зображення замінюється текстом у view.
    return null;
  }
}

export function mapPokemonDetails(value: unknown) {
  const dto = parsePokemon(value);
  if (
    !isObject(value) ||
    !isObject(value.species) ||
    !Array.isArray(value.abilities) ||
    !value.abilities.every(
      (item): item is { ability: { name: string } } =>
        isObject(item) && isObject(item.ability) && isName(item.ability.name),
    )
  ) {
    throw new Error('PokeAPI повернув некоректні деталі Pokémon.');
  }
  const pokemon = mapPokemon(dto);

  return {
    pokemon: {
      ...pokemon,
      spriteUrl: isObject(value.sprites)
        ? spriteUrl(value.sprites.front_default)
        : null,
      abilities: [...new Set(value.abilities.map((item) => item.ability.name))],
    },
    speciesId: resourceId(value.species.url, 'pokemon-species'),
  };
}

export function mapEvolutionChainId(value: unknown): number | null {
  if (!isObject(value))
    throw new Error('PokeAPI повернув некоректний вид Pokémon.');
  if (value.evolution_chain === null) return null;
  if (!isObject(value.evolution_chain)) {
    throw new Error('PokeAPI повернув некоректний ланцюжок еволюцій.');
  }
  return resourceId(value.evolution_chain.url, 'evolution-chain');
}

function mapEvolutionNode(value: unknown, depth = 0): EvolutionNode {
  if (
    depth > 20 ||
    !isObject(value) ||
    !isObject(value.species) ||
    !isName(value.species.name) ||
    !Array.isArray(value.evolves_to)
  ) {
    throw new Error('PokeAPI повернув некоректний ланцюжок еволюцій.');
  }
  return {
    speciesName: value.species.name,
    evolvesTo: value.evolves_to.map((child: unknown) =>
      mapEvolutionNode(child, depth + 1),
    ),
  };
}

export function mapEvolutionChain(value: unknown): EvolutionNode {
  if (!isObject(value))
    throw new Error('PokeAPI повернув некоректний ланцюжок еволюцій.');
  return mapEvolutionNode(value.chain);
}
