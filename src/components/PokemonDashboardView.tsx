import { getPokemonSummary } from '../domain/pokemon/selectors';
import { pokemonTypes } from '../domain/pokemon/types';
import type { Pokemon } from '../domain/pokemon/types';
import { Counter } from './Counter';
import { FilteredPokemonList } from './FilteredPokemonList';
import { KpiCard } from './KpiCard';

interface PokemonDashboardViewProps {
  pokemon: readonly Pokemon[];
  totalCount: number | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function PokemonDashboardView({
  pokemon,
  totalCount,
  loading,
  error,
  onRetry,
}: PokemonDashboardViewProps) {
  const summary = getPokemonSummary(pokemon);
  const ready = !loading && error === null;

  return (
    <>
      <section className="summary-section" aria-labelledby="summary-title">
        <div className="summary-heading">
          <h2 id="summary-title">Pokédex у цифрах</h2>
          <span className="small muted">
            Джерело: PokeAPI · перші 20 записів
          </span>
        </div>
        <div className="kpi-grid">
          <KpiCard
            title="Усього записів Pokémon"
            value={ready ? (totalCount ?? '—') : '—'}
            description="Усі записи PokeAPI, включно з формами"
          />
          <KpiCard
            title="Pokémon у вибірці"
            value={ready ? summary.total : '—'}
            description="Завантажені записи першої сторінки"
          />
          <KpiCard
            title="Типів у вибірці"
            value={ready ? summary.typeCount : '—'}
            description="Унікальні типи завантажених Pokémon"
          />
          <KpiCard
            title="Із двома типами"
            value={ready ? summary.multiTypeCount : '—'}
            description="Серед завантажених Pokémon"
          />
        </div>
        <p className="summary-note small muted">
          KPI вибірки рахуються за всією завантаженою сторінкою й не змінюються
          від фільтра. Загальна кількість записів API не є кількістю окремих
          видів. Pokémon із двома типами належить до обох типів.
        </p>
      </section>
      <div className="dashboard-grid">
        <div aria-busy={loading}>
          {loading ? (
            <section className="panel empty-state" role="status">
              <h2>Завантаження Pokémon…</h2>
              <p className="muted">Отримуємо список і базові характеристики.</p>
            </section>
          ) : error !== null ? (
            <section className="panel empty-state" role="alert">
              <h2>Не вдалося завантажити Pokémon</h2>
              <p className="muted">{error}</p>
              <p className="muted">Перевірте з’єднання та спробуйте ще раз.</p>
              <button
                type="button"
                className="secondary-button"
                onClick={onRetry}
              >
                Повторити запит
              </button>
            </section>
          ) : pokemon.length === 0 ? (
            <section className="panel empty-state" role="status">
              <h2>PokeAPI повернув порожній список</h2>
              <p className="muted">
                На першій сторінці немає записів для показу.
              </p>
            </section>
          ) : (
            <FilteredPokemonList pokemon={pokemon} types={pokemonTypes} />
          )}
        </div>
        <aside className="sidebar" aria-label="Планування команди">
          <Counter title="Місця в команді" />
          <section className="field-note" aria-labelledby="note-title">
            <span className="note-symbol" aria-hidden="true">
              ✦
            </span>
            <h2 id="note-title">Невелика підказка</h2>
            <p>
              Bulbasaur має типи grass і poison. Спробуй обидва фільтри — він
              буде в кожному списку.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
