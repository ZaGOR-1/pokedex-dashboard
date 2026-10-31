import { useState, type ReactNode } from 'react';

interface ThemeToggleProps {
  children: ReactNode;
}

export function ThemeToggle({ children }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className="theme-root" data-theme={isDark ? 'dark' : 'light'}>
      <div className="theme-control">
        <button
          type="button"
          className="theme-button"
          aria-pressed={isDark}
          onClick={() => setIsDark((current) => !current)}
        >
          <span aria-hidden="true">{isDark ? '☾' : '☀'}</span>
          Темна тема
        </button>
      </div>
      {children}
    </div>
  );
}
