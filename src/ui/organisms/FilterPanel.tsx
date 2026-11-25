import type { ComponentProps, ReactNode } from 'react';

interface FilterPanelProps extends ComponentProps<'form'> {
  description?: ReactNode;
}

export function FilterPanel({
  description,
  children,
  ...props
}: FilterPanelProps) {
  return (
    <form {...props}>
      {description}
      <div className="ui-filter-panel">{children}</div>
    </form>
  );
}
