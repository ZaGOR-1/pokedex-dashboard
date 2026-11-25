import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const meta = {
  title: 'Atoms/Select',
  component: Select,
  args: {
    'aria-label': 'Категорія',
    children: (
      <>
        <option value="all">Усі</option>
        <option value="books">Книжки</option>
      </>
    ),
  },
  argTypes: {
    children: { control: false, description: 'Нативні option або optgroup.' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'books' },
};
