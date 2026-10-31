import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('перемикає тему зі сталою назвою кнопки й рендерить children', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ThemeToggle>
        <p>Вміст секції</p>
      </ThemeToggle>,
    );
    const button = screen.getByRole('button', {
      name: 'Темна тема',
      pressed: false,
    });
    expect(container.firstElementChild).toHaveAttribute('data-theme', 'light');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Вміст секції')).toBeInTheDocument();
    await user.click(button);
    expect(container.firstElementChild).toHaveAttribute('data-theme', 'dark');
    expect(
      screen.getByRole('button', { name: 'Темна тема', pressed: true }),
    ).toBe(button);
    await user.click(button);
    expect(container.firstElementChild).toHaveAttribute('data-theme', 'light');
    expect(
      screen.getByRole('button', { name: 'Темна тема', pressed: false }),
    ).toBe(button);
    expect(screen.getByText('Вміст секції')).toBeInTheDocument();
  });

  it.each(['{Enter}', ' '])('підтримує клавішу %s', async (key) => {
    const user = userEvent.setup();
    render(
      <ThemeToggle>
        <p>Вміст секції</p>
      </ThemeToggle>,
    );
    const button = screen.getByRole('button', { name: 'Темна тема' });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard(key);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAccessibleName('Темна тема');
    await user.keyboard(key);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveAccessibleName('Темна тема');
  });
});
