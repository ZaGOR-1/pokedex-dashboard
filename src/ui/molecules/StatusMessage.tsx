import type { ComponentProps } from 'react';
import { Spinner } from '../atoms/Spinner';
import { Card } from './Card';

interface StatusMessageProps extends Omit<
  ComponentProps<'div'>,
  'title' | 'role'
> {
  heading: string;
  headingLevel?: 'h1' | 'h2' | 'h3';
  variant: 'loading' | 'error' | 'empty';
  framed?: boolean;
}

export function StatusMessage({
  heading,
  headingLevel: Heading = 'h2',
  variant,
  framed = true,
  className,
  children,
  ...props
}: StatusMessageProps) {
  const content = (
    <>
      {variant === 'loading' && <Spinner />}
      <Heading>{heading}</Heading>
      {children}
    </>
  );
  const messageProps = {
    ...props,
    role: variant === 'error' ? 'alert' : 'status',
    className: ['ui-status', className].filter(Boolean).join(' '),
  };

  return framed ? (
    <Card {...messageProps}>{content}</Card>
  ) : (
    <div {...messageProps}>{content}</div>
  );
}
