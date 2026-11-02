interface KpiCardProps {
  title: string;
  value: number | string;
  description?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function KpiCard({
  title,
  value,
  description,
  change,
  trend = 'neutral',
}: KpiCardProps) {
  const trendSymbol = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '−';

  return (
    <article className="kpi-card" aria-label={title}>
      <h3>{title}</h3>
      <p className="kpi-value">{value}</p>
      {description && (
        <p className="kpi-description muted small">{description}</p>
      )}
      {change !== undefined && (
        <p className="kpi-change">
          <span className={`trend trend-${trend}`}>
            <span aria-hidden="true">{trendSymbol} </span>
            {change}
          </span>
          <span>демонстраційна зміна</span>
        </p>
      )}
    </article>
  );
}
