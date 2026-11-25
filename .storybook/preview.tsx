import type { Preview } from '@storybook/react-vite';
import '../src/styles/index.css';

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Тема компонента',
      toolbar: {
        title: 'Тема',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Світла' },
          { value: 'dark', title: 'Темна' },
        ],
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, { globals }) => (
      <div
        className="ui-surface"
        data-theme={globals.theme === 'dark' ? 'dark' : 'light'}
        lang="uk"
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
