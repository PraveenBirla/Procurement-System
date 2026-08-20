import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

/**
 * Styled dropdown/select with label, icon, and error state.
 */
const Dropdown = forwardRef(function Dropdown(
  {
    label,
    id,
    options = [],
    placeholder = 'Select an option',
    error,
    icon: Icon,
    className,
    containerClassName,
    required = false,
    ...props
  },
  ref
) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'w-full rounded-lg border bg-surface px-3.5 py-2.5 pr-10 text-sm text-textPrimary appearance-none',
            'transition-all duration-200 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            Icon && 'pl-10',
            error
              ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
              : 'border-slate-300 hover:border-slate-400',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted pointer-events-none" />
      </div>
      {error && (
        <p
          id={`${selectId}-error`}
          className="text-xs text-danger-600 flex items-center gap-1 animate-fade-in"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default Dropdown;
