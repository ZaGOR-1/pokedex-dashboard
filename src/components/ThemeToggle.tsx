import { useDashboardStore } from '../app/dashboardStore';
import { selectTheme } from '../app/dashboardSelectors';

export function ThemeToggle() {
  const theme = useDashboardStore(selectTheme);
  const toggleTheme = useDashboardStore((state) => state.toggleTheme);
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
