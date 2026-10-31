import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('обчислює три KPI з локальної вибірки', () => {
    render(<App />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(
      within(
        screen.getByRole('article', { name: 'Pokémon у вибірці' }),
      ).getByText('12'),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('article', { name: 'Типів у вибірці' }),
      ).getByText('10'),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('article', { name: 'Із двома типами' }),
      ).getByText('4'),
    ).toBeInTheDocument();
    expect(screen.getByText('Демонстраційна вибірка')).toBeInTheDocument();
  });

  it('зберігає незалежний стан віджетів після зміни теми й фільтра', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole('button', { name: 'Збільшити кількість' }),
    );
    await user.selectOptions(screen.getByRole('combobox'), 'water');
    await user.click(
      screen.getByRole('button', { name: 'Темна тема', pressed: false }),
    );
    expect(screen.getByLabelText('Кількість у команді')).toHaveTextContent('1');
    expect(screen.getByRole('combobox')).toHaveValue('water');
    expect(screen.getByText('Squirtle')).toBeInTheDocument();
    expect(screen.getByText('Wartortle')).toBeInTheDocument();
    expect(screen.queryByText('Charmander')).not.toBeInTheDocument();
    expect(
      within(
        screen.getByRole('article', { name: 'Pokémon у вибірці' }),
      ).getByText('12'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Скинути фільтр' }));
    expect(screen.getByLabelText('Кількість у команді')).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: 'Темна тема' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
