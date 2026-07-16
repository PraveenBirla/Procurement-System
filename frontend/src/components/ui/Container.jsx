import clsx from 'clsx';

/**
 * Responsive max-width container wrapper.
 *
 * @param {'sm'|'md'|'lg'|'xl'|'full'} maxWidth
 */
export default function Container({
  children,
  maxWidth = 'lg',
  className,
  ...props
}) {
  const widths = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={clsx(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        widths[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
