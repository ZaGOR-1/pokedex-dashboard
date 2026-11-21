import { describe, expect, it, vi } from 'vitest';
import { isValidMinHp, useDashboardStore } from './dashboardStore';

const current = () => useDashboardStore.getState();

describe('Dashboard store', () => {
  it('починає зі світлої теми, порожніх фільтрів і обраного та bar', () => {
    expect(current()).toMatchObject({
      theme: 'light',
      filters: { search: '', type: 'all', minHp: '' },
      favoriteIds: [],
      chartType: 'bar',
    });
  });

  it('перемикає тему в обидва боки, не змінюючи інший стан', () => {
    const before = current();
    before.toggleTheme();
    expect(current().theme).toBe('dark');
    expect(before.theme).toBe('light');
    expect(current().filters).toBe(before.filters);
    expect(current().favoriteIds).toBe(before.favoriteIds);
    current().toggleTheme();
    expect(current().theme).toBe('light');
  });

  it('оновлює три фільтри імутабельно, зберігаючи введений текст', () => {
    const before = current();
    before.setSearch('  Bulba  ');
    const afterSearch = current();
    afterSearch.setType('poison');
    const afterType = current();
    afterType.setMinHp('060');
    expect(current().filters).toEqual({
      search: '  Bulba  ',
      type: 'poison',
      minHp: '060',
    });
    expect(before.filters).toEqual({ search: '', type: 'all', minHp: '' });
    expect(afterSearch.filters.type).toBe('all');
    expect(afterType.filters.minHp).toBe('');
    expect(current().filters).not.toBe(afterType.filters);
  });

  it('reset очищує лише фільтри', () => {
    current().setSearch('eev');
    current().setType('normal');
    current().setMinHp('50');
    current().toggleTheme();
    current().addFavorite(133);
    current().setChartType('line');
    const before = current();
    current().resetFilters();
    expect(current()).toMatchObject({
      theme: 'dark',
      favoriteIds: [133],
      chartType: 'line',
      filters: { search: '', type: 'all', minHp: '' },
    });
    expect(before.filters).toEqual({
      search: 'eev',
      type: 'normal',
      minHp: '50',
    });
    expect(current().favoriteIds).toBe(before.favoriteIds);
  });

  it('додає унікальні ID та видаляє без мутації попереднього масиву', () => {
    const initial = current().favoriteIds;
    current().addFavorite(133);
    const first = current().favoriteIds;
    current().addFavorite(25);
    current().addFavorite(133);
    const both = current().favoriteIds;
    expect(both).toEqual([133, 25]);
    current().removeFavorite(133);
    expect(current().favoriteIds).toEqual([25]);
    expect(initial).toEqual([]);
    expect(first).toEqual([133]);
    expect(both).toEqual([133, 25]);
    current().removeFavorite(25);
    expect(current().favoriteIds).toEqual([]);
  });

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'ігнорує некоректний ID %s',
    (id) => {
      const before = current();
      before.addFavorite(id);
      expect(current()).toBe(before);
    },
  );

  it('зберігає обране після змін фільтрів і режиму', () => {
    current().addFavorite(133);
    current().setSearch('bulba');
    current().setType('fire');
    current().setMinHp('999');
    current().setChartType('line');
    expect(current().favoriteIds).toEqual([133]);
    current().setChartType('bar');
    expect(current().chartType).toBe('bar');
  });

  it('не сповіщає підписників для дій без зміни значень', () => {
    const listener = vi.fn();
    const unsubscribe = useDashboardStore.subscribe(listener);
    current().setSearch('');
    current().setType('all');
    current().setMinHp('');
    current().setChartType('bar');
    current().resetFilters();
    current().removeFavorite(1);
    expect(listener).not.toHaveBeenCalled();
    current().addFavorite(1);
    current().addFavorite(1);
    current().setSearch('bulba');
    current().setSearch('bulba');
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it.each(['-1', '1.5', ' 1', '1 ', 'abc', '1e3', '9007199254740992'])(
    'не записує некоректний HP %s',
    (value) => {
      const before = current();
      expect(isValidMinHp(value)).toBe(false);
      before.setMinHp(value);
      expect(current()).toBe(before);
    },
  );

  it.each(['', '0', '001', '9007199254740991'])('приймає HP %s', (value) => {
    expect(isValidMinHp(value)).toBe(true);
    current().setMinHp(value);
    expect(current().filters.minHp).toBe(value);
  });
});
