import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { deferred } from '../../tests/deferred';
import { useFetch } from './useFetch';

describe('useFetch', () => {
  it('передає параметри й signal та повертає loading і data', async () => {
    const pending = deferred<string[]>();
    const request = vi.fn<
      (signal: AbortSignal, params: string) => Promise<string[]>
    >(() => pending.promise);
    const { result } = renderHook(() => useFetch(request, 'grass'));
    expect(result.current).toMatchObject({
      data: null,
      loading: true,
      error: null,
    });
    expect(request).toHaveBeenCalledWith(expect.any(AbortSignal), 'grass');
    await act(async () => pending.resolve(['bulbasaur']));
    expect(result.current).toMatchObject({
      data: ['bulbasaur'],
      loading: false,
      error: null,
    });
  });

  it('повертає порожні дані без помилки', async () => {
    const request = async () => [];
    const { result } = renderHook(() => useFetch(request, undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it.each([new Error('Помилка мережі'), 'unknown', new Error('')])(
    'обробляє відхилення %s та дозволяє повторити запит',
    async (failure) => {
      const pending = deferred<number>();
      const request = vi
        .fn<() => Promise<number>>()
        .mockRejectedValueOnce(failure)
        .mockReturnValueOnce(pending.promise);
      const { result } = renderHook(() => useFetch(request, 20));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeTruthy();
      if (failure instanceof Error && failure.message) {
        expect(result.current.error).toBe(failure.message);
      }
      expect(request).toHaveBeenCalledTimes(1);
      act(() => result.current.refetch());
      expect(result.current).toMatchObject({
        data: null,
        error: null,
        loading: true,
      });
      await act(async () => pending.resolve(20));
      expect(result.current).toMatchObject({
        data: 20,
        error: null,
        loading: false,
      });
      expect(request).toHaveBeenCalledTimes(2);
    },
  );

  it('обробляє синхронний виняток джерела', async () => {
    const request = () => {
      throw new Error('Некоректні параметри');
    };
    const { result } = renderHook(() => useFetch(request, undefined));
    await waitFor(() =>
      expect(result.current.error).toBe('Некоректні параметри'),
    );
    expect(result.current.loading).toBe(false);
  });

  it('скасовує запит і не оновлює стан після unmount', async () => {
    const pending = deferred<string>();
    const request = vi.fn<(signal: AbortSignal) => Promise<string>>(
      () => pending.promise,
    );
    const { result, unmount } = renderHook(() => useFetch(request, 'first'));
    const before = result.current;
    unmount();
    expect(request.mock.calls[0]![0].aborted).toBe(true);
    await act(async () => pending.resolve('late'));
    expect(result.current).toBe(before);
  });

  it.each(['success', 'error'])(
    'нові параметри скасовують попередній запит; пізній %s ігнорується',
    async (outcome) => {
      const first = deferred<string>();
      const second = deferred<string>();
      const request = vi.fn((_signal: AbortSignal, params: string) =>
        params === 'first' ? first.promise : second.promise,
      );
      const { result, rerender } = renderHook(
        ({ params }) => useFetch(request, params),
        { initialProps: { params: 'first' } },
      );
      rerender({ params: 'second' });
      expect(request.mock.calls[0]![0].aborted).toBe(true);
      expect(result.current.loading).toBe(true);
      await act(async () => second.resolve('new'));
      await act(async () => {
        if (outcome === 'success') first.resolve('old');
        else first.reject(new Error('Застаріла помилка'));
      });
      expect(result.current).toMatchObject({
        data: 'new',
        error: null,
        loading: false,
      });
      expect(request).toHaveBeenCalledTimes(2);
    },
  );

  it('при зміні параметрів приховує попередні дані до завершення нового запиту', async () => {
    const pending = deferred<number>();
    const request = vi.fn((_signal: AbortSignal, count: number) =>
      count === 1 ? Promise.resolve(1) : pending.promise,
    );
    const { result, rerender } = renderHook(
      ({ count }) => useFetch(request, count),
      { initialProps: { count: 1 } },
    );
    await waitFor(() => expect(result.current.data).toBe(1));
    rerender({ count: 2 });
    expect(result.current).toMatchObject({
      data: null,
      error: null,
      loading: true,
    });
    await act(async () => pending.resolve(2));
    expect(result.current.data).toBe(2);
    rerender({ count: 2 });
    expect(request).toHaveBeenCalledTimes(2);
  });
});
