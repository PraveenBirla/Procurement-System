import { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Reusable Input component with label, leading icon, and error state.
 */
const Input = forwardRef(function Input(
  {
    label,
    id,
    error,
    icon: Icon,
    className,
    containerClassName,
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-textSecondary"
        >
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-textPrimary placeholder:text-textMuted',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            Icon && 'pl-10',
            error
              ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
              : 'border-slate-300 hover:border-slate-400',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-danger-600 flex items-center gap-1 animate-fade-in"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
