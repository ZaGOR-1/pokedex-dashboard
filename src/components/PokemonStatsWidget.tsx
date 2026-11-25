import { Card } from '../ui/molecules/Card';
import { useId } from 'react';
import { useDashboardStore } from '../app/dashboardStore';
import { selectChartType } from '../app/dashboardSelectors';
import { getAverageStats } from '../domain/pokemon/stats';
import type { Pokemon } from '../domain/pokemon/types';
import { ChartTypeToggle } from './ChartTypeToggle';
import { PokemonStatsChart } from './PokemonStatsChart';

export function PokemonStatsWidget({
  pokemon,
}: {
  pokemon: readonly Pokemon[];
}) {
  const id = useId();
  const chartType = useDashboardStore(selectChartType);
  const setChartType = useDashboardStore((state) => state.setChartType);

  return (
    <Card className="stats-widget" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>Середні базові характеристики</h2>
      <p className="muted chart-scope">
        Pokémon після фільтрів: {pokemon.length}. Статистика лише серед перших
        20 завантажених записів, а не всієї бази PokeAPI.
      </p>
      <ChartTypeToggle value={chartType} onChange={setChartType} />
      {pokemon.length === 0 ? (
        <p role="status">
          Немає Pokémon для побудови графіка. Змініть або скиньте фільтри.
        </p>
      ) : (
        <PokemonStatsChart data={getAverageStats(pokemon)} type={chartType} />
      )}
      <p className="small muted">
        Лінія показує профіль шести характеристик, а не зміни в часі. Середнє
        рахується окремо з відомих значень кожної характеристики.
      </p>
    </Card>
  );
}
