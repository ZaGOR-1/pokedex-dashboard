import { expect, test, type Page } from '@playwright/test';
import {
  apiDetails,
  apiEvolution,
  apiSpecies,
  eeveeEvolutions,
} from '../fixtures/details';
import { apiPokemon } from '../fixtures/pokeapi';

async function mockApi(page: Page) {
  const requests: string[] = [];
  const records = [...apiPokemon, apiDetails];
  await page.route('https://pokeapi.co/api/v2/**', async (route) => {
    const url = new URL(route.request().url());
    requests.push(url.pathname + url.search);
    const last = url.pathname.split('/').filter(Boolean).at(-1);
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
    page.getByRole('textbox', { name: 'Мінімальний HP' }),
  ).toHaveValue('50');
  expect(requests.length).toBe(initialCount + 3);
  await page.getByRole('button', { name: 'Скинути фільтри' }).click();
  await expect(
    page.getByRole('status', { name: 'Кількість результатів' }),
  ).toHaveText('Показано 4 із 4');
  await page.getByRole('button', { name: 'HP', exact: true }).click();
  await page.getByRole('button', { name: 'Збільшити кількість' }).click();
  await expect(page.getByLabel('Кількість у команді')).toHaveText('1');
  expect(requests.length).toBe(initialCount + 3);
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
    await mockApi(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('table')).toBeVisible();
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark')
        await page.getByRole('button', { name: 'Темна тема' }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
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
  });
}
