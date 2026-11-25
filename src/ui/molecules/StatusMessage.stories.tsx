import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from '../atoms/Button';
import { StatusMessage } from './StatusMessage';

const meta = {
  title: 'Molecules/StatusMessage',
  component: StatusMessage,
  args: { heading: 'Завантаження…', variant: 'loading' },
  argTypes: {
    variant: { control: 'select', options: ['loading', 'error', 'empty'] },
    headingLevel: { control: 'select', options: ['h1', 'h2', 'h3'] },
    children: { control: false },
  },
} satisfies Meta<typeof StatusMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {};
export const Error: Story = {
  args: {
    heading: 'Не вдалося завантажити список',
    variant: 'error',
    children: <Button onClick={fn()}>Повторити</Button>,
  },
};
export const Empty: Story = {
  args: {
    heading: 'Збігів немає',
    variant: 'empty',
    framed: false,
    children: <p>Змініть фільтри.</p>,
  },
};
