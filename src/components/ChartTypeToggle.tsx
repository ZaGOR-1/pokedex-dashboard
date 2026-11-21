import { useId } from 'react';
import type { ChartType } from '../app/dashboardStore';

interface ChartTypeToggleProps {
  value: ChartType;
  onChange: (value: ChartType) => void;
}

export function ChartTypeToggle({ value, onChange }: ChartTypeToggleProps) {
  const id = useId();
  return (
    <fieldset className="chart-toggle">
      <legend>Тип графіка</legend>
      {(['bar', 'line'] as const).map((type) => (
        <label key={type}>
          <input
            type="radio"
            name={`${id}-chart-type`}
            value={type}
            checked={value === type}
            onChange={() => onChange(type)}
          />
          {type === 'bar' ? 'Стовпчиковий' : 'Лінійний'}
        </label>
      ))}
    </fieldset>
  );
}
