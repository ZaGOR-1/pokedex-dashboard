import type { BaseStats, Pokemon } from './types';

export const statKeys = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
] as const satisfies readonly (keyof BaseStats)[];

export interface AverageStat {
  readonly stat: (typeof statKeys)[number];
  readonly value: number | null;
  readonly count: number;
}

export function getAverageStats(pokemon: readonly Pokemon[]): AverageStat[] {
  return statKeys.map((stat) => {
    let sum = 0;
    let count = 0;
    for (const item of pokemon) {
      const value = item.stats[stat];
      if (typeof value === 'number') {
        sum += value;
        count++;
      }
    }
    return { stat, value: count === 0 ? null : sum / count, count };
  });
}
