import type { ComponentProps } from 'react';

export type BadgeTone =
  | 'neutral'
  | 'info'
  | 'positive'
  | 'danger'
  | 'violet'
  | 'orange'
  | 'blue'
  | 'indigo'
  | 'yellow'
  | 'brown';

interface BadgeProps extends ComponentProps<'span'> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={['ui-badge', `ui-badge--${tone}`, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
