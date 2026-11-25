import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from '../atoms/Button';
import { DataTable } from './DataTable';

const books = [
  { title: 'Острів', pages: 200 },
  { title: 'Місто', pages: 380 },
];

function SortableBooks(props: ComponentProps<typeof DataTable>) {
  const [ascending, setAscending] = useState(true);
  const ordered = books.toSorted((a, b) =>
    ascending ? a.pages - b.pages : b.pages - a.pages,
  );

  return (
    <DataTable
      {...props}
      columns={
        <tr>
          <th scope="col">Назва</th>
          <th scope="col" aria-sort={ascending ? 'ascending' : 'descending'}>
            <Button
              variant="text"
              size="small"
              onClick={() => setAscending(!ascending)}
            >
              Сторінки
            </Button>
          </th>
        </tr>
      }
    >
      {ordered.map((book) => (
        <tr key={book.title}>
          <th scope="row">{book.title}</th>
          <td>{book.pages}</td>
        </tr>
      ))}
    </DataTable>
  );
}

const meta = {
  title: 'Organisms/DataTable',
  component: DataTable,
  args: {
    caption: 'Книжки в колекції',
    scrollLabel: 'Таблиця книжок із прокручуванням',
    columns: (
      <tr>
        <th scope="col">Назва</th>
        <th scope="col">Сторінки</th>
      </tr>
    ),
    children: books.map((book) => (
      <tr key={book.title}>
        <th scope="row">{book.title}</th>
        <td>{book.pages}</td>
      </tr>
    )),
  },
  argTypes: {
    density: { control: 'select', options: ['regular', 'compact'] },
    columns: {
      control: false,
      description:
        'Рядки заголовка, з aria-sort на активній колонці за потреби.',
    },
    children: { control: false, description: 'Рядки тіла таблиці.' },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Compact: Story = { args: { density: 'compact' } };
export const Narrow: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
export const Sorted: Story = {
  render: (args) => <SortableBooks {...args} />,
  play: async ({ canvas, userEvent }) => {
    const region = canvas.getByRole('region', {
      name: 'Таблиця книжок із прокручуванням',
    });
    const table = within(region).getByRole('table', {
      name: 'Книжки в колекції',
    });
    const column = within(table).getByRole('columnheader', {
      name: 'Сторінки',
    });
    await expect(column).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(
      within(column).getByRole('button', { name: 'Сторінки' }),
    );
    await expect(column).toHaveAttribute('aria-sort', 'descending');
    await expect(within(table).getAllByRole('rowheader')[0]).toHaveTextContent(
      'Місто',
    );
  },
};
