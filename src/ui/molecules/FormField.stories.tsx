import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { FormField } from './FormField';

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  args: { htmlFor: 'title', label: 'Назва' },
  argTypes: {
    htmlFor: { description: 'id вкладеного поля.' },
    error: {
      description:
        'Помилка має id з суфіксом -error. Передайте цей id до aria-describedby поля.',
    },
    children: { control: false },
  },
  render: (args) => (
    <FormField {...args}>
      <Input
        id={args.htmlFor}
        aria-invalid={Boolean(args.error)}
        aria-describedby={args.error ? `${args.htmlFor}-error` : undefined}
      />
    </FormField>
  ),
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Invalid: Story = {
  args: { htmlFor: 'invalid-title', error: 'Введіть назву.' },
};
export const Choice: Story = {
  args: { htmlFor: 'category', label: 'Категорія' },
  render: (args) => (
    <FormField {...args}>
      <Select id={args.htmlFor}>
        <option>Книжки</option>
      </Select>
    </FormField>
  ),
};
