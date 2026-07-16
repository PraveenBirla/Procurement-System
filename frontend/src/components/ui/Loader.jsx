import clsx from 'clsx';

/**
 * Loading spinner component.
 *
 * @param {'sm'|'md'|'lg'} size
 * @param {'primary'|'white'|'slate'} color
 */
export default function Loader({
  size = 'md',
  color = 'primary',
  className,
  label = 'Loading...',
}) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  };

  const colors = {
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-white/30 border-t-white',
    slate: 'border-slate-200 border-t-slate-600',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)} role="status">
      <div
        className={clsx(
          'rounded-full animate-spin',
          sizes[size],
          colors[color]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
