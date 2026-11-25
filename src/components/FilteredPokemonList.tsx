import { Button } from '../ui/atoms/Button';
import { StatusMessage } from '../ui/molecules/StatusMessage';
import { PokemonTypeList } from './PokemonTypeList';
import { DataTable } from '../ui/organisms/DataTable';
import { FavoriteButton } from './FavoriteButton';
import { useState } from 'react';
import { Link } from 'react-router';
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
        <DataTable
          scrollLabel="Таблиця Pokémon із горизонтальним прокручуванням"
          caption="Базові характеристики Pokémon. Натисни ID, назву або HP для сортування."
          columns={
            <tr>
              <th scope="col" aria-sort={getAriaSort('id')}>
                <Button
                  className="sort-button"
                  variant="text"
                  size="small"
                  onClick={() => changeSort('id')}
                >
                  ID<span aria-hidden="true">{sortSymbol('id')}</span>
                </Button>
              </th>
              <th scope="col" aria-sort={getAriaSort('name')}>
                <Button
                  className="sort-button"
                  variant="text"
                  size="small"
                  onClick={() => changeSort('name')}
                >
                  Назва<span aria-hidden="true">{sortSymbol('name')}</span>
                </Button>
              </th>
              <th scope="col">Типи</th>
              <th scope="col" aria-sort={getAriaSort('hp')}>
                <Button
                  className="sort-button"
                  variant="text"
                  size="small"
                  onClick={() => changeSort('hp')}
                >
                  HP<span aria-hidden="true">{sortSymbol('hp')}</span>
                </Button>
              </th>
              <th scope="col">Атака</th>
              <th scope="col">Захист</th>
              <th scope="col">Обране</th>
            </tr>
          }
        >
          {visiblePokemon.map((item) => (
            <tr key={item.id}>
              <td className="pokemon-number">
                #{String(item.id).padStart(3, '0')}
              </td>
              <th scope="row" className="pokemon-name" lang="en">
                <Link to={`/pokemon/${item.id}`}>{item.name}</Link>
              </th>
              <td>
                {item.types.length === 0 ? (
                  '—'
                ) : (
                  <PokemonTypeList
                    types={item.types}
                    label={`Типи ${item.name}`}
                  />
                )}
              </td>
              <td>{item.stats.hp ?? '—'}</td>
              <td>{item.stats.attack ?? '—'}</td>
              <td>{item.stats.defense ?? '—'}</td>
              <td>
                <FavoriteButton pokemonId={item.id} pokemonName={item.name} />
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <StatusMessage
          variant="empty"
          heading="Pokémon не знайдено"
          headingLevel="h3"
          framed={false}
        >
          <p className="muted">
            Серед завантажених записів немає Pokémon за цими фільтрами.
          </p>
          <p className="small muted">
            Зміни назву, тип чи HP або скинь фільтри.
          </p>
        </StatusMessage>
      )}
      <p className="list-note small muted">
        Pokémon із двома типами входить до кожного відповідного фільтра.
      </p>
    </>
  );
}
