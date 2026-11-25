import type { ComponentProps, ReactNode } from 'react';

interface FormFieldProps extends ComponentProps<'div'> {
  htmlFor: string;
  label: ReactNode;
  error?: string;
}

export function FormField({
  htmlFor,
  label,
  error,
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div
      {...props}
      className={className ? `ui-form-field ${className}` : 'ui-form-field'}
    >
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && (
        <p className="ui-form-field-error" id={`${htmlFor}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
