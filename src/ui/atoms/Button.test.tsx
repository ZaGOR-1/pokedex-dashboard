import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('виконує дію за Enter і Space без надсилання форми', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSubmit = vi.fn((event: React.SubmitEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={onSubmit}>
        <Button onClick={onClick}>Змінити</Button>
      </form>,
    );
    const button = screen.getByRole('button', { name: 'Змінити' });

    expect(button).toHaveAttribute('type', 'button');
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}[Space]');
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('передає submit і reset та блокує дію для disabled', async () => {
    const user = userEvent.setup();
    const disabledClick = vi.fn();
    const onSubmit = vi.fn((event: React.SubmitEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    const onReset = vi.fn();
    render(
      <form onSubmit={onSubmit} onReset={onReset}>
        <Button disabled onClick={disabledClick}>
          Заблоковано
        </Button>
        <Button type="submit">Готово</Button>
        <Button type="reset">Скинути</Button>
      </form>,
    );
    const blocked = screen.getByRole('button', { name: 'Заблоковано' });
    expect(blocked).toBeDisabled();
    await user.click(blocked);
    expect(disabledClick).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Готово' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Скинути' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
