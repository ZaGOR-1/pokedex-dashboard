import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../atoms/Button';
import { StatusMessage } from './StatusMessage';

describe('StatusMessage', () => {
  it('показує одне повідомлення про завантаження з декоративним спінером', () => {
    render(
      <StatusMessage
        variant="loading"
        headingLevel="h1"
        heading="Завантаження"
      />,
    );
    const status = screen.getByRole('status');
    expect(within(status).getByRole('heading', { level: 1 })).toHaveTextContent(
      'Завантаження',
    );
    expect(status.querySelector('.ui-spinner')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('показує помилку та виконує повтор запиту', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(
      <StatusMessage variant="error" heading="Помилка">
        <Button onClick={retry}>Повторити</Button>
      </StatusMessage>,
    );
    const alert = screen.getByRole('alert');
    await user.click(within(alert).getByRole('button', { name: 'Повторити' }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('показує порожній стан без спінера та повтору', () => {
    render(
      <StatusMessage
        variant="empty"
        heading="Результатів немає"
        framed={false}
      />,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Результатів немає');
    expect(status.querySelector('.ui-spinner')).not.toBeInTheDocument();
    expect(within(status).queryByRole('button')).not.toBeInTheDocument();
  });
});
