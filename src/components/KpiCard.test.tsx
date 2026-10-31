import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('відображає три різні набори props одного компонента', () => {
    render(
      <>
        <KpiCard title="Усього" value={12} change="+3" trend="up" />
        <KpiCard title="Типів" value={10} change="+2" trend="up" />
        <KpiCard title="Із двома типами" value={4} change="−1" trend="down" />
      </>,
    );

    expect(screen.getAllByRole('article')).toHaveLength(3);
    const total = within(screen.getByRole('article', { name: 'Усього' }));
    expect(total.getByRole('heading', { name: 'Усього' })).toBeInTheDocument();
    expect(total.getByText('12')).toBeInTheDocument();
    expect(total.getByText('+3')).toBeInTheDocument();
    expect(
      within(screen.getByRole('article', { name: 'Типів' })).getByText('10'),
    ).toBeInTheDocument();
    const multiType = within(
      screen.getByRole('article', { name: 'Із двома типами' }),
    );
    expect(multiType.getByText('4')).toBeInTheDocument();
    expect(multiType.getByText('−1')).toBeInTheDocument();
  });

  it('підтримує текстове значення без optional trend', () => {
    render(<KpiCard title="Приклад" value="12 Pokémon" change="0" />);
    expect(screen.getByText('12 Pokémon')).toBeInTheDocument();
    expect(screen.getByText('демонстраційна зміна')).toBeInTheDocument();
  });
});
