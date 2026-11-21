import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartType } from '../app/dashboardStore';
import type { AverageStat } from '../domain/pokemon/stats';
import { statLabels } from './pokemonStatLabels';

interface PokemonStatsChartProps {
  data: readonly AverageStat[];
  type: ChartType;
}

const formatValue = (value: number) =>
  value.toLocaleString('uk-UA', { maximumFractionDigits: 1 });

export function PokemonStatsChart({ data, type }: PokemonStatsChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: statLabels[item.stat],
  }));
  const Chart = type === 'bar' ? BarChart : LineChart;

  return (
    <>
      <div className="stats-chart" data-chart-type={type}>
        <ResponsiveContainer width="100%" height={300} minWidth={0}>
          <Chart
            data={chartData}
            margin={{ top: 12, right: 12, bottom: 12, left: 0 }}
            accessibilityLayer
            title={
              type === 'bar'
                ? 'Стовпчиковий графік характеристик'
                : 'Лінійний профіль характеристик'
            }
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              interval={0}
              angle={-30}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 11, fill: 'var(--chart-text)' }}
            />
            <YAxis
              width={38}
              domain={[0, 'auto']}
              tick={{ fill: 'var(--chart-text)' }}
            />
            <Tooltip
              formatter={(value) => [
                typeof value === 'number' ? formatValue(value) : 'Невідомо',
                'Середнє значення',
              ]}
              contentStyle={{
                background: 'var(--chart-surface)',
                borderColor: 'var(--chart-border)',
                color: 'var(--chart-text)',
              }}
            />
            {type === 'bar' ? (
              <Bar
                dataKey="value"
                fill="var(--chart-color)"
                isAnimationActive={false}
              />
            ) : (
              <Line
                type="linear"
                dataKey="value"
                stroke="var(--chart-color)"
                strokeWidth={2}
                connectNulls={false}
                isAnimationActive={false}
              />
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
      <dl className="chart-values" aria-label="Середні характеристики вибірки">
        {chartData.map(({ stat, label, value, count }) => (
          <div key={stat}>
            <dt>{label}</dt>
            <dd>
              <span>{value === null ? 'Невідомо' : formatValue(value)}</span>
              <small className="muted">Відомих значень: {count}</small>
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
