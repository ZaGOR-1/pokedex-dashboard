import type { ComponentProps } from 'react';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'secondary' | 'text' | 'soft';
  size?: 'small' | 'medium' | 'square';
}

export function Button({
  variant = 'secondary',
  size = 'medium',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[
        'ui-button',
        `ui-button--${variant}`,
        `ui-button--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
