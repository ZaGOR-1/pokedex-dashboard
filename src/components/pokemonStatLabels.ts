import type { BaseStats } from '../domain/pokemon/types';

export const statLabels = {
  hp: 'HP',
  attack: 'Атака',
  defense: 'Захист',
  specialAttack: 'Спеціальна атака',
  specialDefense: 'Спеціальний захист',
  speed: 'Швидкість',
} satisfies Record<keyof BaseStats, string>;
