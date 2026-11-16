import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { PokemonFilterValues } from '../components/PokemonFilterForm';

export function PokemonFiltersProvider({ children }: { children: ReactNode }) {
  const form = useForm<PokemonFilterValues>({
    defaultValues: { search: '', type: 'all', minHp: '' },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}
