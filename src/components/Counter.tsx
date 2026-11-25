import { Card } from '../ui/molecules/Card';
import { Button } from '../ui/atoms/Button';
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
    <Card className="counter" aria-labelledby={titleId}>
      <p className="eyebrow">МАЛЕНЬКА КОМАНДА, ВЕЛИКІ ПЛАНИ</p>
      <h2 id={titleId}>{title}</h2>
      <p className="muted">Вибери кількість учасників майбутньої команди.</p>
      <div className="counter-controls">
        <Button
          type="button"
          variant="soft"
          size="square"
          aria-label="Зменшити кількість"
          disabled={count === minCount}
          onClick={() => setCount((current) => Math.max(minCount, current - 1))}
        >
          −
        </Button>
        <output aria-label="Кількість у команді" aria-live="polite">
          {count}
        </output>
        <Button
          type="button"
          variant="soft"
          size="square"
          aria-label="Збільшити кількість"
          disabled={count === maxCount}
          onClick={() => setCount((current) => Math.min(maxCount, current + 1))}
        >
          +
        </Button>
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
      <Button
        type="button"
        className="reset-counter"
        onClick={() => setCount(minCount)}
      >
        Скинути лічильник
      </Button>
      <p className="small muted">
        Це окремий лічильник: він не додає Pokémon зі списку до команди.
      </p>
    </Card>
  );
}
