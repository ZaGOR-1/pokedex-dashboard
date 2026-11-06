import type { Control } from 'react-hook-form';
import { getPokemonSummary } from '../domain/pokemon/selectors';
import type { Pokemon } from '../domain/pokemon/types';
import { Counter } from './Counter';
import { FilteredPokemonList } from './FilteredPokemonList';
import { KpiCard } from './KpiCard';
import { PokemonFilterForm } from './PokemonFilterForm';
import type { PokemonFilterValues } from './PokemonFilterForm';

interface PokemonDashboardViewProps {
  pokemon: readonly Pokemon[];
  totalCount: number | null;
  loadedCount: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  control: Control<PokemonFilterValues>;
  onReset: () => void;
  canReset: boolean;
}

export function PokemonDashboardView({
  pokemon,
  totalCount,
  loadedCount,
  loading,
  error,
  onRetry,
  control,
  onReset,
  canReset,
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
            description="Записи після застосування фільтрів"
          />
          <KpiCard
            title="Типів у вибірці"
            value={ready ? summary.typeCount : '—'}
            description="Унікальні типи відфільтрованих Pokémon"
          />
          <KpiCard
            title="Із двома типами"
            value={ready ? summary.multiTypeCount : '—'}
            description="Серед відфільтрованих Pokémon"
          />
        </div>
        <p className="summary-note small muted">
          KPI вибірки та таблиця враховують однакові відфільтровані записи.
          Загальна кількість записів API не є кількістю окремих видів. Pokémon
          із двома типами належить до обох типів.
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
          ) : loadedCount === 0 ? (
            <section className="panel empty-state" role="status">
              <h2>PokeAPI повернув порожній список</h2>
              <p className="muted">
                На першій сторінці немає записів для показу.
              </p>
            </section>
          ) : (
            <section
              className="panel pokemon-panel"
              aria-labelledby="list-title"
            >
              <div className="section-heading">
                <div>
                  <h2 id="list-title">Знайомі з Канто</h2>
                  <p className="muted">
                    Порівнюй Pokémon у завантаженій вибірці.
                  </p>
                </div>
                <span className="sample-badge">PokeAPI</span>
              </div>
              <PokemonFilterForm
                control={control}
                onReset={onReset}
                canReset={canReset}
              />
              <FilteredPokemonList
                pokemon={pokemon}
                loadedCount={loadedCount}
              />
            </section>
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
