import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('перемикає тему в обидва боки й рендерить children', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ThemeToggle>
        <p>Вміст секції</p>
      </ThemeToggle>,
    );
    const button = screen.getByRole('button', { name: 'Увімкнути темну тему' });
    expect(container.firstElementChild).toHaveAttribute('data-theme', 'light');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Вміст секції')).toBeInTheDocument();
    await user.click(button);
    expect(container.firstElementChild).toHaveAttribute('data-theme', 'dark');
    expect(
      screen.getByRole('button', { name: 'Увімкнути світлу тему' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await user.click(
      screen.getByRole('button', { name: 'Увімкнути світлу тему' }),
    );
    expect(container.firstElementChild).toHaveAttribute('data-theme', 'light');
    expect(screen.getByText('Вміст секції')).toBeInTheDocument();
  });
});
