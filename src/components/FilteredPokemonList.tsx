import { useId, useState } from 'react';
import { filterPokemonByType, sortPokemon } from '../domain/pokemon/selectors';
import type {
  Pokemon,
  StandardPokemonType,
  PokemonTypeFilter,
  PokemonSortField,
  SortDirection,
} from '../domain/pokemon/types';

interface FilteredPokemonListProps {
  pokemon: readonly Pokemon[];
  types: readonly StandardPokemonType[];
}

export function FilteredPokemonList({
  pokemon,
  types,
}: FilteredPokemonListProps) {
  const [typeFilter, setTypeFilter] = useState<PokemonTypeFilter>('all');
  const [sortField, setSortField] = useState<PokemonSortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const filterId = useId();
  const titleId = useId();
  const visiblePokemon = sortPokemon(
    filterPokemonByType(pokemon, typeFilter),
    sortField,
    sortDirection,
  );

  function changeSort(field: PokemonSortField) {
    setSortDirection(
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc',
    );
    setSortField(field);
  }

  function getAriaSort(field: PokemonSortField) {
    return sortField === field
      ? sortDirection === 'asc'
        ? 'ascending'
        : 'descending'
      : undefined;
  }

  function sortSymbol(field: PokemonSortField) {
    return sortField === field ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ' ↕';
  }

  return (
    <section className="panel pokemon-panel" aria-labelledby={titleId}>
      <div className="section-heading">
        <div>
          <h2 id={titleId}>Знайомі з Канто</h2>
          <p className="muted">
            Перші 20 записів. Фільтр працює в межах цієї сторінки.
          </p>
        </div>
        <span className="sample-badge">PokeAPI</span>
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
        <div
          className="table-scroll"
          role="region"
          aria-label="Таблиця Pokémon із горизонтальним прокручуванням"
          tabIndex={0}
        >
          <table className="pokemon-table">
            <caption>
              Базові характеристики Pokémon. Натисни ID, назву або HP для
              сортування.
            </caption>
            <thead>
              <tr>
                <th scope="col" aria-sort={getAriaSort('id')}>
                  <button
                    className="sort-button"
                    type="button"
                    onClick={() => changeSort('id')}
                  >
                    ID<span aria-hidden="true">{sortSymbol('id')}</span>
                  </button>
                </th>
                <th scope="col" aria-sort={getAriaSort('name')}>
                  <button
                    className="sort-button"
                    type="button"
                    onClick={() => changeSort('name')}
                  >
                    Назва<span aria-hidden="true">{sortSymbol('name')}</span>
                  </button>
                </th>
                <th scope="col">Типи</th>
                <th scope="col" aria-sort={getAriaSort('hp')}>
                  <button
                    className="sort-button"
                    type="button"
                    onClick={() => changeSort('hp')}
                  >
                    HP<span aria-hidden="true">{sortSymbol('hp')}</span>
                  </button>
                </th>
                <th scope="col">Атака</th>
                <th scope="col">Захист</th>
              </tr>
            </thead>
            <tbody>
              {visiblePokemon.map((item) => (
                <tr key={item.id}>
                  <td className="pokemon-number">
                    #{String(item.id).padStart(3, '0')}
                  </td>
                  <th scope="row" className="pokemon-name" lang="en">
                    {item.name}
                  </th>
                  <td>
                    {item.types.length === 0 ? (
                      '—'
                    ) : (
                      <ul
                        className="type-list"
                        aria-label={`Типи ${item.name}`}
                      >
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
                    )}
                  </td>
                  <td>{item.stats.hp ?? '—'}</td>
                  <td>{item.stats.attack ?? '—'}</td>
                  <td>{item.stats.defense ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <h3>Pokémon не знайдено</h3>
          <p className="muted">
            Серед завантажених записів немає Pokémon вибраного типу.
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
