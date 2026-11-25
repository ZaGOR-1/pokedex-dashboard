import { Badge } from '../ui/atoms/Badge';
import { Button } from '../ui/atoms/Button';
import { Card } from '../ui/molecules/Card';
import { StatusMessage } from '../ui/molecules/StatusMessage';
import { getPokemonSummary } from '../domain/pokemon/selectors';
import type { Pokemon } from '../domain/pokemon/types';
import { Counter } from './Counter';
import { FilteredPokemonList } from './FilteredPokemonList';
import { KpiCard } from './KpiCard';
import { PokemonFilterForm } from './PokemonFilterForm';
import { PokemonStatsWidget } from './PokemonStatsWidget';

interface PokemonDashboardViewProps {
  pokemon: readonly Pokemon[];
  totalCount: number | null;
  loadedCount: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function PokemonDashboardView({
  pokemon,
  totalCount,
  loadedCount,
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
      {ready && <PokemonStatsWidget pokemon={pokemon} />}
      <div className="dashboard-grid">
        <div>
          {loading ? (
            <StatusMessage variant="loading" heading="Завантаження Pokémon…">
              <p className="muted">Отримуємо список і базові характеристики.</p>
            </StatusMessage>
          ) : error !== null ? (
            <StatusMessage
              variant="error"
              heading="Не вдалося завантажити Pokémon"
            >
              <p className="muted">{error}</p>
              <p className="muted">Перевірте з’єднання та спробуйте ще раз.</p>
              <Button onClick={onRetry}>Повторити запит</Button>
            </StatusMessage>
          ) : loadedCount === 0 ? (
            <StatusMessage
              variant="empty"
              heading="PokeAPI повернув порожній список"
            >
              <p className="muted">
                На першій сторінці немає записів для показу.
              </p>
            </StatusMessage>
          ) : (
            <Card className="pokemon-panel" aria-labelledby="list-title">
              <div className="section-heading">
                <div>
                  <h2 id="list-title">Знайомі з Канто</h2>
                  <p className="muted">
                    Порівнюй Pokémon у завантаженій вибірці.
                  </p>
                </div>
                <Badge tone="info">PokeAPI</Badge>
              </div>
              <PokemonFilterForm />
              <FilteredPokemonList
                pokemon={pokemon}
                loadedCount={loadedCount}
              />
            </Card>
          )}
        </div>
        <aside className="sidebar" aria-label="Планування команди">
          <Counter title="Місця в команді" />
          <Card tone="info" className="field-note" aria-labelledby="note-title">
            <span className="note-symbol" aria-hidden="true">
              ✦
            </span>
            <h2 id="note-title">Невелика підказка</h2>
            <p>
              Bulbasaur має типи grass і poison. Спробуй обидва фільтри — він
              буде в кожному списку.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
