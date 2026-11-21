import { create } from 'zustand';
import type { PokemonTypeFilter } from '../domain/pokemon/types';

export type Theme = 'light' | 'dark';
export type ChartType = 'bar' | 'line';

export interface PokemonFilterValues {
  search: string;
  type: PokemonTypeFilter;
  minHp: string;
}

export interface DashboardState {
  readonly theme: Theme;
  readonly filters: Readonly<PokemonFilterValues>;
  readonly favoriteIds: readonly number[];
  readonly chartType: ChartType;
  toggleTheme: () => void;
  setSearch: (search: string) => void;
  setType: (type: PokemonTypeFilter) => void;
  setMinHp: (minHp: string) => void;
  resetFilters: () => void;
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  setChartType: (chartType: ChartType) => void;
}

const defaultFilters: Readonly<PokemonFilterValues> = {
  search: '',
  type: 'all',
  minHp: '',
};

export function isValidMinHp(value: string) {
  return (
    value === '' || (/^\d+$/.test(value) && Number.isSafeInteger(Number(value)))
  );
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  theme: 'light',
  filters: defaultFilters,
  favoriteIds: [],
  chartType: 'bar',
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setSearch: (search) =>
    set((state) =>
      state.filters.search === search
        ? state
        : { filters: { ...state.filters, search } },
    ),
  setType: (type) =>
    set((state) =>
      state.filters.type === type
        ? state
        : { filters: { ...state.filters, type } },
    ),
  setMinHp: (minHp) =>
    set((state) =>
      !isValidMinHp(minHp) || state.filters.minHp === minHp
        ? state
        : { filters: { ...state.filters, minHp } },
    ),
  resetFilters: () =>
    set((state) =>
      state.filters.search === '' &&
      state.filters.type === 'all' &&
      state.filters.minHp === ''
        ? state
        : { filters: defaultFilters },
    ),
  addFavorite: (id) =>
    set((state) =>
      !Number.isSafeInteger(id) || id < 1 || state.favoriteIds.includes(id)
        ? state
        : { favoriteIds: [...state.favoriteIds, id] },
    ),
  removeFavorite: (id) =>
    set((state) =>
      state.favoriteIds.includes(id)
        ? { favoriteIds: state.favoriteIds.filter((item) => item !== id) }
        : state,
    ),
  setChartType: (chartType) =>
    set((state) => (state.chartType === chartType ? state : { chartType })),
}));
