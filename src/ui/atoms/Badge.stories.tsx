import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, type BadgeTone } from './Badge';

const tones = [
  'neutral',
  'info',
  'positive',
  'danger',
  'violet',
  'orange',
  'blue',
  'indigo',
  'yellow',
  'brown',
] as const satisfies readonly BadgeTone[];

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  args: { children: 'Нове', tone: 'neutral' },
  argTypes: {
    tone: { control: 'select', options: tones },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Palette: Story = {
  render: () => (
    <ul className="type-list">
      {tones.map((tone) => (
        <li key={tone}>
          <Badge tone={tone}>{tone}</Badge>
        </li>
      ))}
    </ul>
  ),
};
