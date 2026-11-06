import { useCallback, useEffect, useState } from 'react';

type Request<T, P> = (signal: AbortSignal, params: P) => Promise<T>;

interface FetchResult<T, P> {
  request: Request<T, P>;
  params: P;
  attempt: number;
  data: T | null;
  error: string | null;
}

// Функція запиту та об'єкт параметрів мають зберігати посилання між рендерами.
export function useFetch<T, P>(request: Request<T, P>, params: P) {
  const [result, setResult] = useState<FetchResult<T, P> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const refetch = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await request(controller.signal, params);
        // Джерело даних може проігнорувати скасування.
        if (controller.signal.aborted) return;
        setResult({ request, params, attempt, data, error: null });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setResult({
          request,
          params,
          attempt,
          data: null,
          error:
            error instanceof Error
              ? error.message || 'Не вдалося завантажити дані.'
              : 'Не вдалося завантажити дані. Перевірте з’єднання.',
        });
      }
    }

    void load();
    return () => controller.abort();
  }, [request, params, attempt]);

  // Поки новий запит не завершився, його результат ще відсутній.
  const current =
    result?.request === request &&
    Object.is(result.params, params) &&
    result.attempt === attempt;

  return {
    data: current ? result.data : null,
    loading: !current,
    error: current ? result.error : null,
    refetch,
  };
}
