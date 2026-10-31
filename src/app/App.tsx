import { Counter } from '../components/Counter';
import { FilteredPokemonList } from '../components/FilteredPokemonList';
import { KpiCard } from '../components/KpiCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { mockPokemon } from '../data/mockPokemon';
import { getPokemonSummary } from '../domain/pokemon/selectors';
import { pokemonTypes } from '../domain/pokemon/types';

export function App() {
  const summary = getPokemonSummary(mockPokemon);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти до вмісту
      </a>
      <ThemeToggle>
        <div className="page">
          <header className="page-header">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true">
                <span />
              </span>
              <div>
                <span className="brand-name">Pokédex</span>
                <span className="brand-caption">ANALYTICS</span>
              </div>
            </div>
          </header>
          <main id="main-content" tabIndex={-1}>
            <section className="intro" aria-labelledby="page-title">
              <p className="eyebrow">ВАРІАНТ 06 · ЛАБОРАТОРНА РОБОТА 01</p>
              <div className="intro-heading">
                <h1 id="page-title">
                  Кожна пригода починається
                  <br className="desktop-break" /> з цікавості<span>.</span>
                </h1>
                <span className="demo-label">
                  <span aria-hidden="true" />
                  Демонстраційна вибірка
                </span>
              </div>
              <p className="intro-description">
                Досліджуй типи Pokémon, стеж за показниками та збирайся у свою
                першу подорож.
              </p>
            </section>
            <section
              className="summary-section"
              aria-labelledby="summary-title"
            >
              <div className="summary-heading">
                <h2 id="summary-title">Вибірка в цифрах</h2>
                <span className="small muted">
                  {summary.total} записів · без підключення до API
                </span>
              </div>
              <div className="kpi-grid">
                <KpiCard
                  title="Pokémon у вибірці"
                  value={summary.total}
                  change="+3"
                  trend="up"
                />
                <KpiCard
                  title="Типів у вибірці"
                  value={summary.typeCount}
                  change="+2"
                  trend="up"
                />
                <KpiCard
                  title="Із двома типами"
                  value={summary.multiTypeCount}
                  change="−1"
                  trend="down"
                />
              </div>
              <p className="summary-note small muted">
                Показники стосуються всіх локальних записів і не змінюються від
                фільтра. Зміни — навчальні приклади, а не порівняння з
                попереднім періодом.
              </p>
            </section>
            <div className="dashboard-grid">
              <FilteredPokemonList pokemon={mockPokemon} types={pokemonTypes} />
              <aside className="sidebar" aria-label="Планування команди">
                <Counter title="Місця в команді" />
                <section className="field-note" aria-labelledby="note-title">
                  <span className="note-symbol" aria-hidden="true">
                    ✦
                  </span>
                  <h2 id="note-title">Невелика підказка</h2>
                  <p>
                    Bulbasaur має типи grass і poison. Спробуй обидва фільтри —
                    він буде в кожному списку.
                  </p>
                </section>
              </aside>
            </div>
          </main>
          <footer className="page-footer">
            <span>Pokédex Analytics · Навчальний проєкт</span>
            <span>Локальна вибірка, жодних запитів до API</span>
          </footer>
        </div>
      </ThemeToggle>
    </>
  );
}
