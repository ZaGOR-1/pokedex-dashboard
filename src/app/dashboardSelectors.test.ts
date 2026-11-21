import { describe, expect, it } from 'vitest';
import { useDashboardStore } from './dashboardStore';
import {
  selectCanResetFilters,
  selectChartType,
  selectFilters,
  selectIsFavorite,
  selectSearch,
  selectTheme,
} from './dashboardSelectors';

describe('Dashboard selectors', () => {
  it('читають початкові значення, не створюючи нових посилань', () => {
    const state = useDashboardStore.getState();
    expect(selectTheme(state)).toBe('light');
    expect(selectChartType(state)).toBe('bar');
    expect(selectSearch(state)).toBe('');
    expect(selectCanResetFilters(state)).toBe(false);
    expect(selectIsFavorite(state, 1)).toBe(false);
    expect(selectFilters(state)).toBe(state.filters);
    expect(selectFilters(state)).toBe(selectFilters(state));
  });

  it('читають зміни після actions та зберігають посилання фільтрів при зміні теми', () => {
    const state = useDashboardStore.getState();
    state.setSearch('eev');
    state.setType('normal');
    state.setMinHp('50');
    const filters = selectFilters(useDashboardStore.getState());
    state.toggleTheme();
    state.addFavorite(133);
    state.setChartType('line');
    const next = useDashboardStore.getState();
    expect(selectFilters(next)).toBe(filters);
    expect(filters).toEqual({ search: 'eev', type: 'normal', minHp: '50' });
    expect(selectTheme(next)).toBe('dark');
    expect(selectChartType(next)).toBe('line');
    expect(selectSearch(next)).toBe('eev');
    expect(selectIsFavorite(next, 133)).toBe(true);
    expect(selectIsFavorite(next, 1)).toBe(false);
    state.removeFavorite(133);
    expect(selectIsFavorite(useDashboardStore.getState(), 133)).toBe(false);
  });

  it.each(['search', 'type', 'minHp'] as const)(
    'reset доступний для окремого поля %s',
    (field) => {
      const state = useDashboardStore.getState();
      if (field === 'search') state.setSearch('a');
      if (field === 'type') state.setType('fire');
      if (field === 'minHp') state.setMinHp('0');
      expect(selectCanResetFilters(useDashboardStore.getState())).toBe(true);
      state.resetFilters();
      expect(selectCanResetFilters(useDashboardStore.getState())).toBe(false);
    },
  );
});
