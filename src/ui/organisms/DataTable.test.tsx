import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { Button } from '../atoms/Button';
import { DataTable } from './DataTable';

function SortableTable() {
  const [ascending, setAscending] = useState(true);
  const values = ascending ? [10, 20] : [20, 10];
  return (
    <DataTable
      caption="Результати"
      scrollLabel="Прокрутка результатів"
      columns={
        <tr>
          <th scope="col" aria-sort={ascending ? 'ascending' : 'descending'}>
            <Button onClick={() => setAscending(!ascending)}>Бали</Button>
          </th>
        </tr>
      }
    >
      {values.map((value) => (
        <tr key={value}>
          <td>{value}</td>
        </tr>
      ))}
    </DataTable>
  );
}

it('зберігає caption, область прокрутки та aria-sort під час сортування з клавіатури', async () => {
  const user = userEvent.setup();
  render(<SortableTable />);
  const region = screen.getByRole('region', { name: 'Прокрутка результатів' });
  const table = within(region).getByRole('table', { name: 'Результати' });
  const header = within(table).getByRole('columnheader', { name: 'Бали' });
  expect(header).toHaveAttribute('aria-sort', 'ascending');
  await user.tab();
  expect(region).toHaveFocus();
  await user.tab();
  expect(within(header).getByRole('button')).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(header).toHaveAttribute('aria-sort', 'descending');
  expect(
    within(table)
      .getAllByRole('cell')
      .map((cell) => cell.textContent),
  ).toEqual(['20', '10']);
});
