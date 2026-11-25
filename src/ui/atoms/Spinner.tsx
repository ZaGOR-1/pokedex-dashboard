import type { ComponentProps } from 'react';

interface SpinnerProps extends Omit<
  ComponentProps<'span'>,
  'children' | 'role'
> {
  size?: 'small' | 'medium';
}

export function Spinner({
  size = 'medium',
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={['ui-spinner', `ui-spinner--${size}`, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
