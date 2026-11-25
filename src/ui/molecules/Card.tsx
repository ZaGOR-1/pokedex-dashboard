import type { ComponentProps } from 'react';

interface CardProps extends ComponentProps<'div'> {
  as?: 'article' | 'section' | 'div';
  tone?: 'default' | 'info';
  padding?: 'normal' | 'compact';
}

export function Card({
  as: Element = 'section',
  tone = 'default',
  padding = 'normal',
  className,
  ...props
}: CardProps) {
  return (
    <Element
      {...props}
      className={[
        'ui-card',
        `ui-card--${tone}`,
        `ui-card--${padding}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
