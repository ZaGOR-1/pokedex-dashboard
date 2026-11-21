import type { DashboardState } from './dashboardStore';

export const selectTheme = (state: DashboardState) => state.theme;
export const selectFilters = (state: DashboardState) => state.filters;
export const selectSearch = (state: DashboardState) => state.filters.search;
export const selectChartType = (state: DashboardState) => state.chartType;
export const selectIsFavorite = (state: DashboardState, id: number) =>
  state.favoriteIds.includes(id);
export const selectCanResetFilters = (state: DashboardState) =>
  state.filters.search !== '' ||
  state.filters.type !== 'all' ||
  state.filters.minHp !== '';
