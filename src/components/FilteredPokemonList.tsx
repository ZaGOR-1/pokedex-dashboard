import { useState } from 'react';
import { sortPokemon } from '../domain/pokemon/selectors';
import type {
  Pokemon,
  PokemonSortField,
  SortDirection,
} from '../domain/pokemon/types';

interface FilteredPokemonListProps {
  pokemon: readonly Pokemon[];
  loadedCount: number;
}

export function FilteredPokemonList({
  pokemon,
  loadedCount,
}: FilteredPokemonListProps) {
  const [sortField, setSortField] = useState<PokemonSortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const visiblePokemon = sortPokemon(pokemon, sortField, sortDirection);

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
    <>
      <p
        className="list-count muted"
        role="status"
        aria-label="Кількість результатів"
      >
        Показано {visiblePokemon.length} із {loadedCount}
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
            Серед завантажених записів немає Pokémon за цими фільтрами.
          </p>
          <p className="small muted">
            Зміни назву, тип чи HP або скинь фільтри.
          </p>
        </div>
      )}
      <p className="list-note small muted">
        Pokémon із двома типами входить до кожного відповідного фільтра.
      </p>
    </>
  );
}
