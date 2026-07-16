import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

/**
 * Reusable Button component with variants, sizes, and loading state.
 *
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} isLoading
 * @param {boolean} fullWidth
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    type = 'button',
    ...props
  },
  ref
) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 active:scale-[0.98]';

  const variants = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
    secondary:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
    outline:
      'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800',
    danger:
      'bg-danger-600 text-white hover:bg-danger-700 shadow-sm',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed active:scale-100',
        className
      )}
      aria-disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

export default Button;
