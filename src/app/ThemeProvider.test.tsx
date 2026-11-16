import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './themeContext';

describe('ThemeContext', () => {
  it('дає двом споживачам один спільний стан', () => {
    const { result } = renderHook(() => [useTheme(), useTheme()] as const, {
      wrapper: ThemeProvider,
    });
    act(() => result.current[0].toggleTheme());
    expect(result.current[0].theme).toBe('dark');
    expect(result.current[1].theme).toBe('dark');
    act(() => result.current[1].toggleTheme());
    expect(result.current[0].theme).toBe('light');
  });

  it('пояснює використання хука поза провайдером', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme потребує ThemeProvider.',
    );
  });
});
