import clsx from 'clsx';

/**
 * Card component with optional hover elevation.
 *
 * @param {'sm'|'md'|'lg'} padding
 * @param {boolean} hover — enable hover shadow lift
 */
export default function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  ...props
}) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-slate-200/80 shadow-sm',
        paddings[padding],
        hover && 'transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
