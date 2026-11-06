import { useId } from 'react';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { pokemonTypes } from '../domain/pokemon/types';
import type { PokemonTypeFilter } from '../domain/pokemon/types';

export interface PokemonFilterValues {
  search: string;
  type: PokemonTypeFilter;
  minHp: string;
}

interface PokemonFilterFormProps {
  control: Control<PokemonFilterValues>;
  onReset: () => void;
  canReset: boolean;
}

export function PokemonFilterForm({
  control,
  onReset,
  canReset,
}: PokemonFilterFormProps) {
  const id = useId();

  return (
    <form
      aria-label="Фільтри Pokémon"
      aria-describedby={`${id}-scope`}
      onSubmit={(event) => event.preventDefault()}
      onReset={(event) => {
        event.preventDefault();
        onReset();
      }}
    >
      <p id={`${id}-scope`} className="small muted filter-scope">
        Пошук і фільтри працюють лише серед перших 20 завантажених записів
        PokeAPI. Назва застосовується через 400 мс після введення.
      </p>
      <div className="filter-bar">
        <div className="filter-field">
          <label htmlFor={`${id}-search`}>Назва Pokémon</label>
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id={`${id}-search`}
                type="search"
                placeholder="Наприклад, bulba"
                autoComplete="off"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="filter-field">
          <label htmlFor={`${id}-type`}>Тип Pokémon</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                id={`${id}-type`}
                value={field.value}
                onChange={(event) => {
                  const type = pokemonTypes.find(
                    (item) => item === event.target.value,
                  );
                  field.onChange(type ?? 'all');
                }}
              >
                <option value="all">Усі типи</option>
                {pokemonTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="filter-field">
          <label htmlFor={`${id}-hp`}>Мінімальний HP</label>
          <Controller
            name="minHp"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id={`${id}-hp`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-describedby={`${id}-hp-hint`}
                placeholder="Без обмеження"
                value={field.value}
                onChange={(event) => {
                  const value = event.target.value;
                  if (
                    value === '' ||
                    (/^\d+$/.test(value) && Number.isSafeInteger(Number(value)))
                  ) {
                    field.onChange(value);
                  }
                }}
              />
            )}
          />
        </div>
        <button type="reset" className="text-button" disabled={!canReset}>
          Скинути фільтри
        </button>
      </div>
      <p id={`${id}-hp-hint`} className="small muted filter-hint">
        HP: ціле число від 0. Порожнє поле прибирає обмеження.
      </p>
    </form>
  );
}
