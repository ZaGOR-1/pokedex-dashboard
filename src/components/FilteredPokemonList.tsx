import { useId, useState } from 'react';
import { filterPokemonByType } from '../domain/pokemon/selectors';
import type {
  Pokemon,
  PokemonType,
  PokemonTypeFilter,
} from '../domain/pokemon/types';

interface FilteredPokemonListProps {
  pokemon: readonly Pokemon[];
  types: readonly PokemonType[];
}

export function FilteredPokemonList({
  pokemon,
  types,
}: FilteredPokemonListProps) {
  const [typeFilter, setTypeFilter] = useState<PokemonTypeFilter>('all');
  const filterId = useId();
  const titleId = useId();
  const visiblePokemon = filterPokemonByType(pokemon, typeFilter);

  return (
    <section className="panel pokemon-panel" aria-labelledby={titleId}>
      <div className="section-heading">
        <div>
          <h2 id={titleId}>Знайомі з Канто</h2>
          <p className="muted">Невелика вибірка для першого знайомства.</p>
        </div>
        <span className="sample-badge">Локальні дані</span>
      </div>
      <div className="filter-bar">
        <div className="filter-field">
          <label htmlFor={filterId}>Тип Pokémon</label>
          <select
            id={filterId}
            value={typeFilter}
            onChange={(event) => {
              const selectedType = types.find(
                (type) => type === event.target.value,
              );
              setTypeFilter(selectedType ?? 'all');
            }}
          >
            <option value="all">Усі типи</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="text-button"
          onClick={() => setTypeFilter('all')}
          disabled={typeFilter === 'all'}
        >
          Скинути фільтр
        </button>
      </div>
      <p className="list-count muted" role="status">
        Показано {visiblePokemon.length} із {pokemon.length}
      </p>
      {visiblePokemon.length > 0 ? (
        <ul className="pokemon-list" aria-label="Список Pokémon">
          {visiblePokemon.map((item) => (
            <li key={item.id} className="pokemon-row">
              <span className="pokemon-number">
                #{String(item.id).padStart(3, '0')}
              </span>
              <span className="pokemon-name" lang="en">
                {item.name}
              </span>
              <ul className="type-list" aria-label={`Типи ${item.name}`}>
                {item.types.map((type) => (
                  <li
                    key={type}
                    className={`type-badge type-${type}`}
                    lang="en"
                  >
                    {type}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <h3>Pokémon не знайдено</h3>
          <p className="muted">
            У цій демовибірці немає Pokémon вибраного типу.
          </p>
          <p className="small muted">Вибери інший тип або скинь фільтр.</p>
        </div>
      )}
      <p className="list-note small muted">
        Pokémon із двома типами входить до кожного відповідного фільтра.
      </p>
    </section>
  );
}
