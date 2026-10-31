import { useId, useState } from 'react';

interface CounterProps {
  title: string;
}

const minCount = 0;
const maxCount = 6;

export function Counter({ title }: CounterProps) {
  const [count, setCount] = useState(minCount);
  const titleId = useId();

  return (
    <section className="panel counter" aria-labelledby={titleId}>
      <p className="eyebrow">МАЛЕНЬКА КОМАНДА, ВЕЛИКІ ПЛАНИ</p>
      <h2 id={titleId}>{title}</h2>
      <p className="muted">Вибери кількість учасників майбутньої команди.</p>
      <div className="counter-controls">
        <button
          type="button"
          className="step-button"
          aria-label="Зменшити кількість"
          disabled={count === minCount}
          onClick={() => setCount((current) => Math.max(minCount, current - 1))}
        >
          −
        </button>
        <output aria-label="Кількість у команді" aria-live="polite">
          {count}
        </output>
        <button
          type="button"
          className="step-button"
          aria-label="Збільшити кількість"
          disabled={count === maxCount}
          onClick={() => setCount((current) => Math.min(maxCount, current + 1))}
        >
          +
        </button>
      </div>
      <meter
        min={minCount}
        max={maxCount}
        value={count}
        aria-label="Заповнення команди"
      >
        {count} із {maxCount}
      </meter>
      <p className="counter-caption">
        {count} із {maxCount} місць · межі 0–6
      </p>
      <button
        type="button"
        className="secondary-button reset-counter"
        onClick={() => setCount(minCount)}
      >
        Скинути лічильник
      </button>
      <p className="small muted">
        Це окремий лічильник: він не додає Pokémon зі списку до команди.
      </p>
    </section>
  );
}
