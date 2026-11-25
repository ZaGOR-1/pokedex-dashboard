import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  args: { children: 'Повторити', onClick: fn() },
  argTypes: {
    variant: { control: 'select', options: ['secondary', 'text', 'soft'] },
    size: { control: 'select', options: ['small', 'medium', 'square'] },
    type: { description: 'За замовчуванням button. Підтримує submit і reset.' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Повторити' });
    await expect(button).toHaveAttribute('type', 'button');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Text: Story = { args: { variant: 'text', size: 'small' } };
export const Disabled: Story = { args: { disabled: true } };
export const Pressed: Story = {
  args: { children: 'До обраного', 'aria-pressed': true },
};
export const Step: Story = {
  args: {
    children: '+',
    'aria-label': 'Збільшити',
    variant: 'soft',
    size: 'square',
  },
};
