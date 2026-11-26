import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number, immediate = false): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  if (immediate && !Object.is(debouncedValue, value)) {
    setDebouncedValue(value);
  }

  useEffect(() => {
    if (immediate) return;
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay, immediate]);

  return immediate ? value : debouncedValue;
}
