import { useEffect, useState } from 'react';
import type { LoadPokemon } from '../application/pokemon/loadPokemon';
import type { Pokemon } from '../domain/pokemon/types';
import { PokemonDashboardView } from './PokemonDashboardView';

interface PokemonDashboardProps {
  loadPokemon: LoadPokemon;
}

export function PokemonDashboard({ loadPokemon }: PokemonDashboardProps) {
  const [pokemon, setPokemon] = useState<readonly Pokemon[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const page = await loadPokemon(controller.signal);
        // Захист потрібний навіть для джерела, яке не підтримує скасування.
        if (controller.signal.aborted) return;
        setPokemon(page.pokemon);
        setTotalCount(page.totalCount);
        setError(null);
        setLoading(false);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setError(
          error instanceof Error
            ? error.message
            : 'Не вдалося завантажити дані. Перевірте з’єднання.',
        );
        setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [loadPokemon, attempt]);

  function retry() {
    setError(null);
    setLoading(true);
    setAttempt((value) => value + 1);
  }

  return (
    <PokemonDashboardView
      pokemon={pokemon}
      totalCount={totalCount}
      loading={loading}
      error={error}
      onRetry={retry}
    />
  );
}
