import clsx from 'clsx';
import { ROLE_COLORS } from '../../constants/roles';

/**
 * Badge / pill component for displaying roles and statuses.
 *
 * @param {'default'|'success'|'warning'|'danger'|'info'} variant
 * @param {string} role — if provided, auto-maps to role-specific colours
 * @param {'sm'|'md'} size
 */
export default function Badge({
  children,
  variant = 'default',
  role: roleName,
  size = 'md',
  className,
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-sky-50 text-sky-700',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  // If a role name is given, use role-specific colours
  const colorClass = roleName
    ? ROLE_COLORS[roleName] || variants.default
    : variants[variant];

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        colorClass,
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
