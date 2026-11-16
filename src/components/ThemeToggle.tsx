import { useTheme } from '../app/themeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="theme-control">
      <button
        type="button"
        className="theme-button"
        aria-pressed={isDark}
        onClick={toggleTheme}
      >
        <span aria-hidden="true">{isDark ? '☾' : '☀'}</span>
        Темна тема
      </button>
    </div>
  );
}
