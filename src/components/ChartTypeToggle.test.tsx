import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ChartTypeToggle } from './ChartTypeToggle';

describe('ChartTypeToggle', () => {
  it('отримує режим через props і повідомляє про вибір', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <ChartTypeToggle value="bar" onChange={onChange} />,
    );
    expect(
      screen.getByRole('group', { name: 'Тип графіка' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Стовпчиковий' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Лінійний' }));
    expect(onChange).toHaveBeenCalledWith('line');
    rerender(<ChartTypeToggle value="line" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: 'Лінійний' })).toBeChecked();
  });

  it('дозволяє перемкнути режим стрілкою на клавіатурі', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChartTypeToggle value="bar" onChange={onChange} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('line');
  });
});
