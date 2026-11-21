import type { ReactNode } from 'react';
import { useDashboardStore } from './dashboardStore';
import { selectTheme } from './dashboardSelectors';

export function ThemeRoot({ children }: { children: ReactNode }) {
  const theme = useDashboardStore(selectTheme);
  return (
    <div className="theme-root" data-theme={theme}>
      {children}
    </div>
  );
}
