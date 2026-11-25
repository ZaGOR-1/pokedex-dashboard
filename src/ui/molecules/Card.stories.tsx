import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'Molecules/Card',
  component: Card,
  args: {
    children: (
      <>
        <h2>Книжки</h2>
        <p>12 нотаток у колекції.</p>
      </>
    ),
  },
  argTypes: {
    as: { control: 'select', options: ['article', 'section', 'div'] },
    tone: { control: 'select', options: ['default', 'info'] },
    padding: { control: 'select', options: ['normal', 'compact'] },
    children: { control: false },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Compact: Story = { args: { as: 'article', padding: 'compact' } };
export const Info: Story = { args: { tone: 'info' } };
