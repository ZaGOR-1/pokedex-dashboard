import { Button } from '../ui/atoms/Button';
import { Input } from '../ui/atoms/Input';
import { Select } from '../ui/atoms/Select';
import { FormField } from '../ui/molecules/FormField';
import { FilterPanel } from '../ui/organisms/FilterPanel';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { isValidMinHp, useDashboardStore } from '../app/dashboardStore';
import type { PokemonFilterValues } from '../app/dashboardStore';
import {
  selectCanResetFilters,
  selectFilters,
} from '../app/dashboardSelectors';
import { pokemonTypes } from '../domain/pokemon/types';

const hpError = 'Укажіть невід’ємне ціле число в допустимих межах.';

export function PokemonFilterForm() {
  const filters = useDashboardStore(selectFilters);
  const canReset = useDashboardStore(selectCanResetFilters);
  const setSearch = useDashboardStore((state) => state.setSearch);
  const setType = useDashboardStore((state) => state.setType);
  const setMinHp = useDashboardStore((state) => state.setMinHp);
  const resetFilters = useDashboardStore((state) => state.resetFilters);
  const {
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PokemonFilterValues>({
    values: filters,
    mode: 'onChange',
  });
  const id = useId();

  return (
    <FilterPanel
      aria-label="Фільтри Pokémon"
      aria-describedby={`${id}-scope`}
      onSubmit={(event) => event.preventDefault()}
      onReset={(event) => {
        event.preventDefault();
        clearErrors();
        resetFilters();
      }}
      description={
        <p id={`${id}-scope`} className="small muted filter-scope">
          Пошук і фільтри працюють лише серед перших 20 завантажених записів
          PokeAPI. Назва застосовується через 400 мс після введення.
        </p>
      }
    >
      <FormField htmlFor={`${id}-search`} label="Назва Pokémon">
        <Controller
          name="search"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id={`${id}-search`}
              type="search"
              placeholder="Наприклад, bulba"
              autoComplete="off"
              value={field.value}
              onChange={(event) => {
                field.onChange(event);
                setSearch(event.target.value);
              }}
            />
          )}
        />
      </FormField>
      <FormField htmlFor={`${id}-type`} label="Тип Pokémon">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              id={`${id}-type`}
              value={field.value}
              onChange={(event) => {
                const type = pokemonTypes.find(
                  (item) => item === event.target.value,
                );
                field.onChange(type ?? 'all');
                setType(type ?? 'all');
              }}
            >
              <option value="all">Усі типи</option>
              {pokemonTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          )}
        />
      </FormField>
      <FormField
        htmlFor={`${id}-hp`}
        label="Мінімальний HP"
        error={errors.minHp?.message}
      >
        <Controller
          name="minHp"
          control={control}
          rules={{
            validate: (value) => isValidMinHp(value) || hpError,
          }}
          render={({ field }) => (
            <Input
              {...field}
              id={`${id}-hp`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-describedby={
                errors.minHp ? `${id}-hp-hint ${id}-hp-error` : `${id}-hp-hint`
              }
              aria-invalid={Boolean(errors.minHp)}
              placeholder="Без обмеження"
              value={field.value}
              onChange={(event) => {
                const value = event.target.value;
                if (isValidMinHp(value)) {
                  clearErrors('minHp');
                  field.onChange(value);
                  setMinHp(value);
                } else {
                  setError('minHp', {
                    type: 'validate',
                    message: hpError,
                  });
                }
              }}
            />
          )}
        />
        <p id={`${id}-hp-hint`} className="small muted filter-hint">
          HP: ціле число від 0. Порожнє поле прибирає обмеження.
        </p>
      </FormField>
      <Button type="reset" variant="text" disabled={!canReset}>
        Скинути фільтри
      </Button>
    </FilterPanel>
  );
}
