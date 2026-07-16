import clsx from 'clsx';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
} from 'lucide-react';

/**
 * Alert banner component.
 *
 * @param {'success'|'warning'|'error'|'info'} type
 * @param {boolean} dismissible
 */
export default function Alert({
  children,
  type = 'info',
  title,
  dismissible = false,
  onDismiss,
  className,
}) {
  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-800',
      textColor: 'text-emerald-700',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-800',
      textColor: 'text-amber-700',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
    info: {
      bg: 'bg-sky-50 border-sky-200',
      icon: Info,
      iconColor: 'text-sky-600',
      titleColor: 'text-sky-800',
      textColor: 'text-sky-700',
    },
  };

  const c = config[type];
  const IconComponent = c.icon;

  return (
    <div
      className={clsx(
        'flex items-start gap-3 rounded-lg border p-4 animate-fade-in',
        c.bg,
        className
      )}
      role="alert"
    >
      <IconComponent className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', c.iconColor)} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={clsx('text-sm font-semibold mb-0.5', c.titleColor)}>
            {title}
          </p>
        )}
        <p className={clsx('text-sm', c.textColor)}>{children}</p>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={clsx(
            'flex-shrink-0 p-0.5 rounded-md transition-colors cursor-pointer',
            c.iconColor,
            'hover:bg-black/5'
          )}
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
