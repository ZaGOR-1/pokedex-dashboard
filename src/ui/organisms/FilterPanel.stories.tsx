import { useId, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { FormField } from '../molecules/FormField';
import { FilterPanel } from './FilterPanel';

function FilterExample(args: ComponentProps<typeof FilterPanel>) {
  const id = useId();
  return (
    <FilterPanel {...args}>
      <FormField htmlFor={`${id}-search`} label="Назва">
        <Input id={`${id}-search`} name="search" type="search" />
      </FormField>
      <FormField htmlFor={`${id}-kind`} label="Жанр">
        <Select id={`${id}-kind`} name="kind">
          <option value="all">Усі</option>
          <option value="fiction">Художні</option>
        </Select>
      </FormField>
      <Button type="reset" variant="text">
        Скинути
      </Button>
    </FilterPanel>
  );
}

const meta = {
  title: 'Organisms/FilterPanel',
  component: FilterPanel,
  args: {
    'aria-label': 'Фільтри',
    description: <p>Знайдіть книжку в колекції.</p>,
    onSubmit: (event) => event.preventDefault(),
  },
  argTypes: {
    description: {
      control: false,
      description: 'Текст або підказка над полями.',
    },
    children: { control: false },
  },
  render: (args) => <FilterExample {...args} />,
} satisfies Meta<typeof FilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Reset: Story = {
  play: async ({ canvas, userEvent }) => {
    const search = canvas.getByRole('searchbox', { name: 'Назва' });
    const kind = canvas.getByRole('combobox', { name: 'Жанр' });
    await userEvent.type(search, 'Місто');
    await userEvent.selectOptions(kind, 'fiction');
    await expect(search).toHaveValue('Місто');
    await expect(kind).toHaveValue('fiction');
    await userEvent.click(canvas.getByRole('button', { name: 'Скинути' }));
    await expect(search).toHaveValue('');
    await expect(kind).toHaveValue('all');
  },
};
