import type { ComponentProps, ReactNode } from 'react';

interface DataTableProps extends ComponentProps<'table'> {
  caption: ReactNode;
  columns: ReactNode;
  scrollLabel: string;
  density?: 'regular' | 'compact';
}

export function DataTable({
  caption,
  columns,
  scrollLabel,
  density = 'regular',
  className,
  children,
  ...props
}: DataTableProps) {
  return (
    <div
      className="ui-table-scroll"
      role="region"
      aria-label={scrollLabel}
      tabIndex={0}
    >
      <table
        {...props}
        className={['ui-table', `ui-table--${density}`, className]
          .filter(Boolean)
          .join(' ')}
      >
        <caption>{caption}</caption>
        <thead>{columns}</thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
