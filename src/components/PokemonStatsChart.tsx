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

// Recharts очікує числа для розрахунку області графіка й осей.
const chartLayout = {
  height: 300,
  margin: { top: 12, right: 12, bottom: 12, left: 0 },
  gridDash: '3 3',
  labelAngle: -30,
  xAxisHeight: 100,
  yAxisWidth: 38,
  lineWidth: 2,
};

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
        <ResponsiveContainer
          width="100%"
          height={chartLayout.height}
          minWidth={0}
        >
          <Chart
            data={chartData}
            margin={chartLayout.margin}
            accessibilityLayer
            title={
              type === 'bar'
                ? 'Стовпчиковий графік характеристик'
                : 'Лінійний профіль характеристик'
            }
          >
            <CartesianGrid strokeDasharray={chartLayout.gridDash} />
            <XAxis
              dataKey="label"
              interval={0}
              angle={chartLayout.labelAngle}
              textAnchor="end"
              height={chartLayout.xAxisHeight}
              tick={{ fill: 'var(--chart-text)' }}
            />
            <YAxis
              width={chartLayout.yAxisWidth}
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
                strokeWidth={chartLayout.lineWidth}
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
