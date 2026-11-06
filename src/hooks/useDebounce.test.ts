import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('повертає початкове значення без затримки', () => {
    const { result } = renderHook(() => useDebounce(42, 400));
    expect(result.current).toBe(42);
  });

  it('застосовує зміну лише через задану затримку', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: '' } },
    );
    rerender({ value: 'bulba' });
    act(() => vi.advanceTimersByTime(399));
    expect(result.current).toBe('');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('bulba');
  });

  it('скасовує попередній таймер і застосовує лише останнє значення', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: '' } },
    );
    rerender({ value: 'bul' });
    act(() => vi.advanceTimersByTime(300));
    rerender({ value: 'bulba' });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('');
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('bulba');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('перезапускає таймер після зміни затримки й підтримує об’єкти', () => {
    const first = { name: 'bulba' };
    const second = { name: 'ivy' };
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: first, delay: 400 } },
    );
    rerender({ value: second, delay: 400 });
    act(() => vi.advanceTimersByTime(300));
    rerender({ value: second, delay: 100 });
    act(() => vi.advanceTimersByTime(99));
    expect(result.current).toBe(first);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(second);
  });

  it('очищує таймер під час unmount', () => {
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: '' } },
    );
    rerender({ value: 'bulba' });
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
