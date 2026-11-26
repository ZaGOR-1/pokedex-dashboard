import { expect, test, type Page } from '@playwright/test';
import {
  apiDetails,
  apiEvolution,
  apiSpecies,
  eeveeEvolutions,
} from '../fixtures/details';
import { apiPokemon, pokemonTypeResponse } from '../fixtures/pokeapi';

async function mockApi(page: Page) {
  const requests: string[] = [];
  const records = [...apiPokemon, apiDetails];
  await page.route('https://pokeapi.co/api/v2/**', async (route) => {
    const url = new URL(route.request().url());
    requests.push(url.pathname + url.search);
    const last = url.pathname.split('/').filter(Boolean).at(-1);
    if (url.pathname.includes('/type/') && last)
      return route.fulfill({
        json: pokemonTypeResponse(last, ['test-pokemon', 'test-form']),
      });
    if (url.pathname.includes('pokemon-species'))
      return route.fulfill({ json: apiSpecies });
    if (url.pathname.includes('evolution-chain'))
      return route.fulfill({ json: apiEvolution });
    if (url.search)
      return route.fulfill({
        json: { count: 1351, results: records.map(({ name }) => ({ name })) },
      });
    const pokemon = records.find(
      (item) => item.name === last || String(item.id) === last,
    );
    if (!pokemon) return route.fulfill({ status: 404 });
    return route.fulfill({
      json: { ...apiDetails, ...pokemon, sprites: null },
    });
  });
  return requests;
}

test('таблиця → деталі → Назад: фільтри, тема та кеш без перезавантаження', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const requests = await mockApi(page);
  await page.goto('/');
  await expect(page.getByRole('table')).toBeVisible();
  const initialCount = requests.length;
  expect(initialCount).toBe(5);
  await page.getByRole('searchbox', { name: 'Назва Pokémon' }).fill('eev');
  await page.getByRole('combobox').selectOption('normal');
  await page.getByRole('textbox', { name: 'Мінімальний HP' }).fill('50');
  await expect(
    page.getByRole('status', { name: 'Кількість результатів' }),
  ).toHaveText('Показано 1 із 4');
  await page.getByRole('button', { name: 'Темна тема' }).click();
  await page.evaluate(() => {
    document.documentElement.dataset.navigationCheck = 'same-document';
  });
  await page.getByRole('link', { name: 'eevee', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/pokemon/133');
  await expect(
    page.getByRole('heading', { name: 'eevee', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.dataset.navigationCheck),
  ).toBe('same-document');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('term')).toHaveCount(6);
  for (const name of eeveeEvolutions)
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  await expect(page.getByText('run-away', { exact: true })).toBeVisible();
  await expect(page.locator('[data-theme]')).toHaveAttribute(
    'data-theme',
    'dark',
  );
  await page.getByRole('link', { name: /Назад до дашборду/ }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(
    page.getByRole('searchbox', { name: 'Назва Pokémon' }),
  ).toHaveValue('eev');
  await expect(page.getByRole('combobox')).toHaveValue('normal');
  await expect(
    page.getByRole('article', {
      name: 'Записів типу normal в усій базі PokeAPI',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'Мінімальний HP' }),
  ).toHaveValue('50');
  expect(requests.length).toBe(initialCount + 4);
  await page.getByRole('button', { name: 'Скинути фільтри' }).click();
  await expect(
    page.getByRole('status', { name: 'Кількість результатів' }),
  ).toHaveText('Показано 4 із 4');
  await page.getByRole('button', { name: 'HP', exact: true }).click();
  await page.getByRole('button', { name: 'Збільшити кількість' }).click();
  await expect(page.getByLabel('Кількість у команді')).toHaveText('1');
  expect(requests.length).toBe(initialCount + 4);
  expect(errors).toEqual([]);
});

test('прямий URL, оновлення, історія браузера та тема на невідомому маршруті', async ({
  page,
}) => {
  const requests = await mockApi(page);
  await page.goto('/pokemon/133');
  await expect(
    page.getByRole('heading', { name: 'eevee', exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(3);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'eevee', exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(6);
  await page.getByRole('button', { name: 'Темна тема' }).click();
  await page.getByRole('link', { name: /Назад до дашборду/ }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole('heading', { name: 'eevee', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Темна тема' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/missing');
  await expect(
    page.getByRole('heading', { name: 'Сторінку не знайдено' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Темна тема' }).click();
  await expect(page.locator('[data-theme]')).toHaveAttribute(
    'data-theme',
    'dark',
  );
});

test('некоректний ID, відсутній ID і HTTP 404 відповідь', async ({ page }) => {
  const requests = await mockApi(page);
  await page.goto('/pokemon/abc');
  await expect(
    page.getByRole('heading', { name: 'Некоректний ID Pokémon' }),
  ).toBeVisible();
  expect(requests).toHaveLength(0);
  await page.goto('/pokemon');
  await expect(
    page.getByRole('heading', { name: 'Сторінку не знайдено' }),
  ).toBeVisible();
  expect(requests).toHaveLength(0);
  await page.goto('/pokemon/999999');
  await expect(
    page.getByRole('heading', { name: 'Pokémon не знайдено' }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(requests).toHaveLength(1);
});

test('loading, помилка API та ручний повтор', async ({ page }) => {
  await mockApi(page);
  let finish: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    finish = resolve;
  });
  await page.route(
    '**/api/v2/pokemon/133',
    async (route) => {
      await held;
      await route.fulfill({ status: 503 });
    },
    { times: 1 },
  );
  await page.goto('/pokemon/133');
  await expect(page.getByRole('status')).toContainText('Завантаження');
  finish?.();
  await expect(page.getByRole('alert')).toContainText('503');
  await page.getByRole('button', { name: 'Повторити запит' }).click();
  await expect(
    page.getByRole('heading', { name: 'eevee', exact: true }),
  ).toBeVisible();
});

test('швидка зміна :id ігнорує стару відповідь', async ({ page }) => {
  await mockApi(page);
  let finish: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let completed: (() => void) | undefined;
  const released = new Promise<void>((resolve) => {
    completed = resolve;
  });
  await page.route('**/api/v2/pokemon/133', async (route) => {
    await held;
    await route.fulfill({ json: { ...apiDetails, sprites: null } });
    completed?.();
  });
  await page.goto('/pokemon/133');
  await expect(page.getByRole('status')).toContainText('Завантаження');
  // Імітація зміни URL без демонтування компонента деталей.
  await page.evaluate(() => {
    history.pushState(null, '', '/pokemon/1');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(
    page.getByRole('heading', { name: 'bulbasaur', exact: true }),
  ).toBeVisible();
  finish?.();
  await released;
  await expect(
    page.getByRole('heading', { name: 'eevee', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'bulbasaur', exact: true }),
  ).toBeVisible();
});

for (const width of [320, 375, 768, 1280]) {
  test(`адаптивність дашборду й деталей: ${width}px, обидві теми`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        errors.push(message.text());
    });
    await mockApi(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('table')).toBeVisible();
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark')
        await page.getByRole('button', { name: 'Темна тема' }).click();
      await expect(
        page.getByRole('article', {
          name: 'Розподіл Pokémon за типами у вибірці',
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.getByRole('combobox').selectOption('fire');
      await expect(
        page.getByRole('article', {
          name: 'Записів типу fire в усій базі PokeAPI',
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      await page.getByRole('combobox').selectOption('all');
      for (const type of ['Стовпчиковий', 'Лінійний']) {
        await page.getByRole('radio', { name: type }).check();
        await expect(page.getByRole('application')).toBeVisible();
        await expect(page.locator('.stats-chart svg text').first()).toHaveCSS(
          'fill',
          theme === 'dark' ? 'rgb(229, 234, 244)' : 'rgb(32, 43, 65)',
        );
        const bounds = await page.getByRole('application').boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.width).toBeGreaterThan(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      }
    }
    await page.getByRole('link', { name: 'eevee', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'eevee', exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole('button', { name: 'Темна тема' }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

function averageHp(page: Page) {
  return page
    .getByLabel('Середні характеристики вибірки')
    .getByText('HP', { exact: true })
    .locator('..')
    .locator('dd > span');
}

for (const type of ['bar', 'line'] as const) {
  test(`графік ${type}: SVG, tooltip, три фільтри й reset без перезапиту списку`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        errors.push(message.text());
    });
    const requests = await mockApi(page);
    await page.goto('/');
    await expect(page.getByRole('table')).toBeVisible();
    expect(requests).toHaveLength(5);
    await page
      .getByRole('radio', {
        name: type === 'bar' ? 'Стовпчиковий' : 'Лінійний',
      })
      .check();
    const chart = page.locator(`[data-chart-type="${type}"]`);
    await expect(chart.locator('svg.recharts-surface')).toBeVisible();
    if (type === 'bar')
      await expect(chart.locator('.recharts-bar-rectangle path')).toHaveCount(
        6,
      );
    else await expect(chart.locator('.recharts-line-curve')).toHaveCount(1);
    await expect(averageHp(page)).toHaveText('45,8');
    await page.getByRole('application').focus();
    await page.keyboard.press('ArrowRight');
    await expect(chart.locator('.recharts-tooltip-wrapper')).toBeVisible();
    await expect(chart.locator('.recharts-tooltip-wrapper')).toContainText(
      'Середнє значення',
    );
    await expect(chart.locator('.recharts-tooltip-wrapper')).toContainText(
      /\d/,
    );
    await page.getByRole('searchbox').fill('bulba');
    await expect(averageHp(page)).toHaveText('45');
    await page.getByRole('button', { name: 'Скинути фільтри' }).click();
    await expect(averageHp(page)).toHaveText('45,8');
    await page
      .getByRole('combobox', { name: 'Тип Pokémon' })
      .selectOption('fire');
    await expect(averageHp(page)).toHaveText('39');
    await expect(
      page.getByRole('article', {
        name: 'Записів типу fire в усій базі PokeAPI',
      }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Скинути фільтри' }).click();
    await page.getByRole('textbox', { name: 'Мінімальний HP' }).fill('50');
    await expect(averageHp(page)).toHaveText('55');
    await page.getByRole('textbox', { name: 'Мінімальний HP' }).fill('999');
    await expect(
      page.getByText(/Немає Pokémon для побудови графіка/),
    ).toBeVisible();
    await expect(page.locator('.stats-chart svg')).toHaveCount(0);
    await page.getByRole('button', { name: 'Скинути фільтри' }).click();
    await expect(averageHp(page)).toHaveText('45,8');
    await expect(
      page.getByRole('radio', {
        name: type === 'bar' ? 'Стовпчиковий' : 'Лінійний',
      }),
    ).toBeChecked();
    expect(requests).toHaveLength(6);
    expect(requests.filter((path) => path.includes('/type/'))).toEqual([
      '/api/v2/type/fire',
    ]);
    expect(errors).toEqual([]);
  });
}

test('обране, режим і тема між маршрутами; reload очищує стан і кеш', async ({
  page,
}) => {
  const requests = await mockApi(page);
  await page.goto('/');
  await expect(page.getByRole('table')).toBeVisible();
  await page.getByRole('button', { name: 'Обране: eevee' }).focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('button', { name: 'Обране: eevee' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('radio', { name: 'Лінійний' }).check();
  await page.getByRole('button', { name: 'Темна тема' }).click();
  await page.getByRole('combobox').selectOption('normal');
  await page.getByRole('link', { name: 'eevee', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'eevee', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Обране: eevee' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Обране: eevee' }).click();
  await page.getByRole('link', { name: /Назад до дашборду/ }).click();
  await expect(
    page.getByRole('button', { name: 'Обране: eevee' }),
  ).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('radio', { name: 'Лінійний' })).toBeChecked();
  await expect(page.getByRole('combobox')).toHaveValue('normal');
  await expect(page.locator('[data-theme]')).toHaveAttribute(
    'data-theme',
    'dark',
  );
  await expect(
    page.getByRole('article', {
      name: 'Записів типу normal в усій базі PokeAPI',
    }),
  ).toBeVisible();
  expect(requests).toHaveLength(9);
  await page.getByRole('button', { name: 'Обране: eevee' }).click();
  await page.reload();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Стовпчиковий' })).toBeChecked();
  await expect(page.getByRole('combobox')).toHaveValue('all');
  await expect(page.locator('[data-theme]')).toHaveAttribute(
    'data-theme',
    'light',
  );
  await expect(
    page.getByRole('button', { name: 'Обране: eevee' }),
  ).toHaveAttribute('aria-pressed', 'false');
  expect(requests).toHaveLength(14);
});

test('прямі деталі: обране до завантаження списку, видалення клавішею Space та reload', async ({
  page,
}) => {
  const requests = await mockApi(page);
  await page.goto('/pokemon/133');
  await expect(
    page.getByRole('heading', { name: 'eevee', exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(3);
  await page.getByRole('button', { name: 'Обране: eevee' }).click();
  await page.getByRole('link', { name: /Назад до дашборду/ }).click();
  await expect(page.getByRole('table')).toBeVisible();
  const button = page.getByRole('button', {
    name: 'Обране: eevee',
  });
  await button.focus();
  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('link', { name: 'eevee', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Обране: eevee' }),
  ).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Обране: eevee' }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Обране: eevee' }),
  ).toHaveAttribute('aria-pressed', 'false');
  expect(requests).toHaveLength(14);
});

test('форма: курсор посередині тексту, валідація HP та скасування debounce після reset', async ({
  page,
}) => {
  await mockApi(page);
  await page.goto('/');
  await expect(page.getByRole('table')).toBeVisible();
  const search = page.getByRole('searchbox');
  await search.fill('bulbasaur');
  await search.evaluate((element: HTMLInputElement) =>
    element.setSelectionRange(3, 3),
  );
  await search.press('x');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('bulxbasaur');
  expect(
    await search.evaluate(
      (element: HTMLInputElement) => element.selectionStart,
    ),
  ).toBe(4);
  const hp = page.getByRole('textbox', { name: 'Мінімальний HP' });
  await hp.fill('45');
  await hp.fill('-1');
  await expect(hp).toHaveValue('45');
  await expect(hp).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Скинути фільтри' }).click();
  await expect(hp).toHaveAttribute('aria-invalid', 'false');
  await page.clock.install();
  await search.fill('eev');
  await page.clock.fastForward(250);
  await page.getByRole('button', { name: 'Скинути фільтри' }).click();
  await page.clock.fastForward(1000);
  await expect(search).toHaveValue('');
  await expect(averageHp(page)).toHaveText('45,8');
  await expect(
    page.getByRole('status', { name: 'Кількість результатів' }),
  ).toHaveText('Показано 4 із 4');
});

test('після застосованого пошуку reset і негайний ввід не повертають стару вибірку', async ({
  page,
}) => {
  await mockApi(page);
  await page.goto('/');
  const search = page.getByRole('searchbox');
  const rows = page.getByRole('rowheader');
  await expect(rows).toHaveCount(4);
  await page.clock.install({ time: new Date('2026-11-26T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-26T12:00:01Z'));
  await search.fill('bulba');
  await page.clock.runFor(400);
  await expect(rows).toHaveText(['bulbasaur']);
  await page.getByRole('button', { name: 'Скинути фільтри' }).click();
  await expect(search).toHaveValue('');
  await expect(rows).toHaveCount(4);
  await search.fill('char');
  await search.evaluate((input: HTMLInputElement) =>
    input.setSelectionRange(2, 2),
  );
  await expect(rows).toHaveCount(4);
  await page.clock.runFor(399);
  await expect(rows).toHaveCount(4);
  await page.clock.runFor(1);
  await expect(rows).toHaveText(['charmander']);
  await expect(search).toBeFocused();
  expect(
    await search.evaluate((input: HTMLInputElement) => input.selectionStart),
  ).toBe(2);
});

test('локальний і глобальний KPI типу мають різне охоплення та кеш', async ({
  page,
}) => {
  const requests = await mockApi(page);
  const typeRequests = () => requests.filter((path) => path.includes('/type/'));
  await page.goto('/');
  const type = page.getByRole('combobox', { name: 'Тип Pokémon' });
  const local = page.getByRole('article', { name: 'Pokémon у вибірці' });
  const global = page.getByRole('article', {
    name: 'Записів типу poison в усій базі PokeAPI',
  });
  const distribution = page.getByRole('article', {
    name: 'Розподіл Pokémon за типами у вибірці',
  });
  await expect(distribution.getByText('poison')).toBeVisible();
  expect(typeRequests()).toEqual([]);
  await type.selectOption('poison');
  await expect(local).toContainText(
    'Записи типу poison після застосування фільтрів',
  );
  await expect(local.locator('.kpi-value')).toHaveText('1');
  await expect(global.locator('.kpi-value')).toHaveText('2');
  await page.getByRole('searchbox').fill('char');
  await expect(local.locator('.kpi-value')).toHaveText('0');
  await page.getByRole('textbox', { name: 'Мінімальний HP' }).fill('999');
  await expect(global.locator('.kpi-value')).toHaveText('2');
  await page.getByRole('button', { name: 'Скинути фільтри' }).click();
  await expect(global).toHaveCount(0);
  await expect(distribution).toBeVisible();
  await type.selectOption('poison');
  await expect(global.locator('.kpi-value')).toHaveText('2');
  expect(typeRequests()).toEqual(['/api/v2/type/poison']);
});

test('дизайн-система: клавіатурний фокус і кольори позначок в обох темах', async ({
  page,
}) => {
  await mockApi(page);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/');
  const table = page.getByRole('table');
  const scrollRegion = page.getByRole('region', {
    name: 'Таблиця Pokémon із горизонтальним прокручуванням',
  });
  const search = page.getByRole('searchbox', { name: 'Назва Pokémon' });
  const theme = page.getByRole('button', { name: 'Темна тема' });
  const reset = page.getByRole('button', { name: 'Скинути фільтри' });
  const badges = table.locator('.ui-badge');

  await expect(table).toBeVisible();
  await expect(reset).toBeDisabled();
  const colors = [];
  for (const mode of ['light', 'dark']) {
    await theme.focus();
    if (mode === 'dark') await page.keyboard.press('Space');
    await expect(theme).toHaveAttribute(
      'aria-pressed',
      String(mode === 'dark'),
    );
    await expect(page.locator('[data-theme]')).toHaveAttribute(
      'data-theme',
      mode,
    );

    await search.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(search).toBeFocused();
    await expect(search).toHaveCSS('outline-style', 'solid');

    await scrollRegion.focus();
    await expect(scrollRegion).toBeFocused();
    expect(
      await scrollRegion.evaluate(
        (node) => node.scrollWidth > node.clientWidth,
      ),
    ).toBe(true);

    colors.push(
      await badges.evaluateAll((nodes) =>
        nodes.map((node) => {
          const { color, backgroundColor } = getComputedStyle(node);
          return [color, backgroundColor];
        }),
      ),
    );
  }
  expect(colors[0]?.length).toBeGreaterThan(0);
  expect(colors[1]).not.toEqual(colors[0]);
});

test('дизайн-система: спінер зупиняється за зменшеного руху', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://pokeapi.co/api/v2/**', () => {});
  await page.goto('/');
  const status = page
    .getByRole('status')
    .filter({ hasText: 'Завантаження Pokémon' });
  const spinner = status.locator('.ui-spinner');
  await expect(status).toBeVisible();
  await expect(spinner).toHaveAttribute('aria-hidden', 'true');
  await expect(spinner).toHaveCSS('animation-name', 'none');
});
