import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Counter } from './Counter';

describe('Counter', () => {
  it('збільшує, зменшує та скидає локальне значення', async () => {
    const user = userEvent.setup();
    render(<Counter title="Команда" />);
    const count = screen.getByLabelText('Кількість у команді');
    const increase = screen.getByRole('button', {
      name: 'Збільшити кількість',
    });
    expect(count).toHaveTextContent('0');
    await user.click(increase);
    await user.click(increase);
    expect(count).toHaveTextContent('2');
    await user.click(
      screen.getByRole('button', { name: 'Зменшити кількість' }),
    );
    expect(count).toHaveTextContent('1');
    await user.click(screen.getByRole('button', { name: 'Скинути лічильник' }));
    expect(count).toHaveTextContent('0');
  });

  it('залишається в межах 0–6 і відновлює кнопки після скидання', async () => {
    const user = userEvent.setup();
    render(<Counter title="Команда" />);
    const decrease = screen.getByRole('button', { name: 'Зменшити кількість' });
    const increase = screen.getByRole('button', {
      name: 'Збільшити кількість',
    });
    const count = screen.getByLabelText('Кількість у команді');
    expect(decrease).toBeDisabled();
    await user.click(decrease);
    expect(count).toHaveTextContent('0');
    for (let step = 0; step < 8; step += 1) {
      await user.click(increase);
    }
    expect(count).toHaveTextContent('6');
    expect(increase).toBeDisabled();
    expect(decrease).toBeEnabled();
    expect(
      screen.getByRole('meter', { name: 'Заповнення команди' }),
    ).toHaveAttribute('value', '6');
    await user.click(screen.getByRole('button', { name: 'Скинути лічильник' }));
    expect(count).toHaveTextContent('0');
    expect(decrease).toBeDisabled();
    expect(increase).toBeEnabled();
  });

  it('підтримує клавіатуру й незалежний стан двох лічильників', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Counter title="Перша команда" />
        <Counter title="Друга команда" />
      </>,
    );
    await user.tab();
    expect(
      screen.getAllByRole('button', { name: 'Збільшити кількість' })[0],
    ).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(
      screen
        .getAllByLabelText('Кількість у команді')
        .map((item) => item.textContent),
    ).toEqual(['1', '0']);
  });
});
