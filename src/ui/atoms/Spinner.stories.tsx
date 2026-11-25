import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta = {
  title: 'Atoms/Spinner',
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          'Декоративний індикатор. Поруч має бути текстовий стан, наприклад у StatusMessage.',
      },
    },
  },
  argTypes: { size: { control: 'select', options: ['small', 'medium'] } },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { size: 'medium' } };
export const Small: Story = { args: { size: 'small' } };
