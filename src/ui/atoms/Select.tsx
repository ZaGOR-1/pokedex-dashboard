import type { ComponentProps } from 'react';

type SelectProps = ComponentProps<'select'>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={className ? `ui-select ${className}` : 'ui-select'}
    />
  );
}
