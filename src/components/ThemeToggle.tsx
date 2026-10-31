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
          aria-label={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
          onClick={() => setIsDark((current) => !current)}
        >
          {isDark ? (
            <>
              <span aria-hidden="true">☀</span> Світла тема
            </>
          ) : (
            <>
              <span aria-hidden="true">☾</span> Темна тема
            </>
          )}
        </button>
      </div>
      {children}
    </div>
  );
}
