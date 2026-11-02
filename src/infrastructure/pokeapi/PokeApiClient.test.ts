import { describe, expect, it, vi } from 'vitest';
import { deferred } from '../../../tests/deferred';
import { apiList, apiPokemon } from '../../../tests/fixtures/pokeapi';
import { createPokeApiClient } from './PokeApiClient';

const response = (data: unknown) => new Response(JSON.stringify(data));

describe('PokeApiClient', () => {
  it('отримує першу сторінку і перетворює details на доменну модель', async () => {
    const fetcher = vi.fn<typeof fetch>(async (input) => {
      const name = String(input).split('/').at(-1);
      return response(
        String(input).includes('?')
          ? apiList
          : apiPokemon.find((item) => item.name === name),
      );
    });
    const controller = new AbortController();
    const page = await createPokeApiClient(fetcher).loadPokemon(
      controller.signal,
    );
    expect(page.totalCount).toBe(1350);
    expect(page.pokemon.map((item) => item.id)).toEqual([1, 4, 7]);
    expect(page.pokemon[0]?.stats).toEqual({ hp: 45, attack: 49, defense: 49 });
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(fetcher).toHaveBeenCalledWith(
      'https://pokeapi.co/api/v2/pokemon?limit=20&offset=0',
      { signal: expect.any(AbortSignal) },
    );
  });

  it('для порожнього списку не запитує details', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ count: 0, results: [] }));
    await expect(
      createPokeApiClient(fetcher).loadPokemon(new AbortController().signal),
    ).resolves.toEqual({ totalCount: 0, pokemon: [] });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([404, 503])('повідомляє HTTP %i', async (status) => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status }));
    await expect(
      createPokeApiClient(fetcher).loadPokemon(new AbortController().signal),
    ).rejects.toThrow(String(status));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('передає мережеву помилку, не повертаючи порожні дані', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(
      createPokeApiClient(fetcher).loadPokemon(new AbortController().signal),
    ).rejects.toThrow('Не вдалося з’єднатися з PokeAPI');
  });

  it('помилка detail перериває всю сторінку та скасовує сусідні запити', async () => {
    let detailSignal: AbortSignal | undefined;
    const fetcher = vi.fn<typeof fetch>(async (input, options) => {
      if (String(input).includes('?')) return response(apiList);
      detailSignal = options?.signal ?? undefined;
      return new Response(null, { status: 404 });
    });
    await expect(
      createPokeApiClient(fetcher).loadPokemon(new AbortController().signal),
    ).rejects.toThrow('404');
    expect(detailSignal?.aborted).toBe(true);
  });

  it('не починає запити зі скасованим signal', async () => {
    const fetcher = vi.fn<typeof fetch>();
    const controller = new AbortController();
    controller.abort();
    await expect(
      createPokeApiClient(fetcher).loadPokemon(controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('відхиляє некоректний JSON як помилку формату', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('not-json'));
    await expect(
      createPokeApiClient(fetcher).loadPokemon(new AbortController().signal),
    ).rejects.toThrow('некоректному форматі');
  });

  it('після скасування details не починає наступну групу запитів', async () => {
    const pending = Array.from({ length: 4 }, () => deferred<Response>());
    const started = deferred<void>();
    let details = 0;
    const fetcher = vi.fn<typeof fetch>(async (input) => {
      if (String(input).includes('?'))
        return response({
          count: 5,
          results: Array.from({ length: 5 }, () => ({ name: 'bulbasaur' })),
        });
      const index = details++;
      if (details === 4) started.resolve();
      return pending[index]!.promise;
    });
    const controller = new AbortController();
    const request = createPokeApiClient(fetcher).loadPokemon(controller.signal);
    const rejected = expect(request).rejects.toMatchObject({
      name: 'AbortError',
    });
    await started.promise;
    controller.abort();
    for (const item of pending) item.resolve(response(apiPokemon[0]));
    await rejected;
    expect(details).toBe(4);
    expect(fetcher).toHaveBeenCalledTimes(5);
  });

  it('скасовує активний HTTP-запит', async () => {
    const started = deferred<AbortSignal>();
    const fetcher = vi.fn<typeof fetch>(
      (_input, options) =>
        new Promise((_resolve, reject) => {
          const signal = options?.signal;
          if (!signal) throw new Error('Очікувався signal');
          started.resolve(signal);
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Скасовано', 'AbortError')),
            { once: true },
          );
        }),
    );
    const controller = new AbortController();
    const request = createPokeApiClient(fetcher).loadPokemon(controller.signal);
    const rejected = expect(request).rejects.toMatchObject({
      name: 'AbortError',
    });
    const signal = await started.promise;
    controller.abort();
    await rejected;
    expect(signal.aborted).toBe(true);
  });

  it('завантажує не більше чотирьох details одночасно й зберігає порядок', async () => {
    const pending = Array.from({ length: 9 }, () => deferred<Response>());
    const firstBatch = deferred<void>();
    const secondBatch = deferred<void>();
    const thirdBatch = deferred<void>();
    let active = 0;
    let maximum = 0;
    let details = 0;
    const fetcher = vi.fn<typeof fetch>(async (input) => {
      if (String(input).includes('?'))
        return response({
          count: 9,
          results: pending.map((_, index) => ({ name: `pokemon-${index}` })),
        });
      const index = Number(String(input).split('-').at(-1));
      active++;
      maximum = Math.max(maximum, active);
      details++;
      if (details === 4) firstBatch.resolve();
      if (details === 8) secondBatch.resolve();
      if (details === 9) thirdBatch.resolve();
      const result = await pending[index]!.promise;
      active--;
      return result;
    });
    const request = createPokeApiClient(fetcher).loadPokemon(
      new AbortController().signal,
    );
    await firstBatch.promise;
    expect(details).toBe(4);
    for (const index of [3, 2, 1, 0])
      pending[index]!.resolve(response({ ...apiPokemon[0], id: index + 1 }));
    await secondBatch.promise;
    expect(details).toBe(8);
    for (let index = 4; index < 8; index++)
      pending[index]!.resolve(response({ ...apiPokemon[0], id: index + 1 }));
    await thirdBatch.promise;
    pending[8]!.resolve(response({ ...apiPokemon[0], id: 9 }));
    expect((await request).pokemon.map((item) => item.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
    expect(maximum).toBe(4);
  });

  it('відхиляє сторінку понад 20 записів до початку details', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        count: 21,
        results: Array.from({ length: 21 }, () => ({ name: 'bulbasaur' })),
      }),
    );
    await expect(
      createPokeApiClient(fetcher).loadPokemon(new AbortController().signal),
    ).rejects.toThrow('більше записів');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
