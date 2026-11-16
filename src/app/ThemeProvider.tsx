import { useState, type ReactNode } from 'react';
import { ThemeContext } from './themeContext';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme: () =>
          setTheme((current) => (current === 'light' ? 'dark' : 'light')),
      }}
    >
      <div className="theme-root" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
