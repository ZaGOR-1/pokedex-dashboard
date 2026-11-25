import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { FormField } from './FormField';

describe('FormField, Input і Select', () => {
  it('пов’язує label, поле та помилку і передає кероване значення', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();

    function ControlledInput() {
      const [value, setValue] = useState('');
      return (
        <FormField htmlFor="book-title" label="Назва" error="Назва закоротка.">
          <Input
            id="book-title"
            name="title"
            ref={ref}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={onBlur}
            aria-invalid="true"
            aria-describedby="book-title-error"
          />
        </FormField>
      );
    }

    render(<ControlledInput />);
    const input = screen.getByRole('textbox', { name: 'Назва' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('name', 'title');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Назва закоротка.');
    expect(screen.getByRole('alert')).toHaveTextContent('Назва закоротка.');
    await user.click(screen.getByText('Назва', { selector: 'label' }));
    expect(input).toHaveFocus();
    await user.keyboard('Книга');
    expect(input).toHaveValue('Книга');
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('передає ref та події керованого Select', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLSelectElement>();
    const onBlur = vi.fn();

    function ControlledSelect() {
      const [value, setValue] = useState('all');
      return (
        <FormField htmlFor="category" label="Категорія">
          <Select
            id="category"
            name="category"
            ref={ref}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={onBlur}
          >
            <option value="all">Усі</option>
            <option value="books">Книжки</option>
          </Select>
        </FormField>
      );
    }

    render(<ControlledSelect />);
    const select = screen.getByRole('combobox', { name: 'Категорія' });
    expect(ref.current).toBe(select);
    expect(select).toHaveAttribute('name', 'category');
    await user.selectOptions(select, 'books');
    expect(select).toHaveValue('books');
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
