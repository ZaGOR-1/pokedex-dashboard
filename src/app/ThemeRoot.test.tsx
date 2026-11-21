import { act, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDashboardStore } from './dashboardStore';
import { selectTheme } from './dashboardSelectors';
import { ThemeRoot } from './ThemeRoot';

describe('ThemeRoot і спільна тема', () => {
  it('дає двом споживачам один стан без окремого Context', () => {
    const first = renderHook(() => useDashboardStore(selectTheme));
    const second = renderHook(() => useDashboardStore(selectTheme));
    act(() => useDashboardStore.getState().toggleTheme());
    expect(first.result.current).toBe('dark');
    expect(second.result.current).toBe('dark');
    act(() => useDashboardStore.getState().toggleTheme());
    expect(first.result.current).toBe('light');
    expect(second.result.current).toBe('light');
  });

  it('застосовує тему й зберігає дочірній вміст', () => {
    const { container } = render(
      <ThemeRoot>
        <p>Вміст</p>
      </ThemeRoot>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-theme', 'light');
    act(() => useDashboardStore.getState().toggleTheme());
    expect(container.firstElementChild).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByText('Вміст')).toBeInTheDocument();
  });
});
