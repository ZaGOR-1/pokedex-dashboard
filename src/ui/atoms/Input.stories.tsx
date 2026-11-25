import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  args: { type: 'search', placeholder: 'Введіть назву', 'aria-label': 'Назва' },
  argTypes: {
    type: { control: 'select', options: ['search', 'text', 'radio'] },
    'aria-invalid': { control: 'boolean' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Search: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = {
  args: {
    type: 'text',
    inputMode: 'numeric',
    defaultValue: '-5',
    'aria-invalid': true,
    'aria-label': 'Мінімум',
  },
};
export const Radio: Story = {
  args: {
    type: 'radio',
    name: 'example',
    defaultChecked: true,
    placeholder: undefined,
  },
  render: (args) => (
    <label>
      <Input {...args} aria-label={undefined} /> Перший варіант
    </label>
  ),
};
