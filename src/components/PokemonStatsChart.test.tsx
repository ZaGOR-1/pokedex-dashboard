import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PokemonStatsChart } from './PokemonStatsChart';
import { getAverageStats } from '../domain/pokemon/stats';
import { mapPokemon } from '../infrastructure/pokeapi/mapper';
import { apiPokemon } from '../../tests/fixtures/pokeapi';

describe('PokemonStatsChart', () => {
  it.each(['bar', 'line'] as const)(
    'рендерить справжній SVG та шість значень: %s',
    async (type) => {
      const { container } = render(
        <PokemonStatsChart
          data={getAverageStats(apiPokemon.map(mapPokemon))}
          type={type}
        />,
      );
      const chart = await screen.findByRole('application');
      expect(chart.tagName.toLowerCase()).toBe('svg');
      expect(
        container.querySelector(`[data-chart-type="${type}"]`),
      ).toContainElement(chart);
      expect(
        container.querySelector(
          type === 'bar'
            ? '.recharts-bar-rectangle path'
            : '.recharts-line-curve',
        ),
      ).not.toBeNull();
      const values = screen.getByLabelText('Середні характеристики вибірки');
      expect(within(values).getAllByRole('term')).toHaveLength(6);
      expect(within(values).getByText('42,7')).toBeInTheDocument();
      expect(within(values).getAllByText('Відомих значень: 3')).toHaveLength(6);
    },
  );

  it('показує невідомі значення окремо від нуля', () => {
    const data = getAverageStats([
      mapPokemon({
        ...apiPokemon[0],
        stats: [{ base_stat: 0, stat: { name: 'hp' } }],
      }),
    ]);
    render(<PokemonStatsChart data={data} type="line" />);
    const values = screen.getByLabelText('Середні характеристики вибірки');
    expect(within(values).getByText('0', { exact: true })).toBeInTheDocument();
    expect(within(values).getAllByText('Невідомо')).toHaveLength(5);
    expect(within(values).getAllByText('Відомих значень: 0')).toHaveLength(5);
  });
});
