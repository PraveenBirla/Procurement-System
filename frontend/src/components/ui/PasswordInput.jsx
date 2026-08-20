import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import clsx from 'clsx';
import {
  PASSWORD_REQUIREMENTS,
  getPasswordStrength,
  STRENGTH_COLORS,
} from '../../utils/validators';

/**
 * Password input with show/hide toggle, strength meter, and requirements checklist.
 *
 * @param {boolean} showStrength  — show strength bar & requirements checklist
 * @param {string} watchValue    — current password value (for live strength calc)
 */
const PasswordInput = forwardRef(function PasswordInput(
  {
    label,
    id,
    error,
    icon: Icon,
    showStrength = false,
    watchValue = '',
    className,
    containerClassName,
    required = false,
    ...props
  },
  ref
) {
  const [visible, setVisible] = useState(false);

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const strength = showStrength ? getPasswordStrength(watchValue) : null;

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

      {/* Input field */}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={clsx(
            'w-full rounded-lg border bg-surface px-3.5 py-2.5 pr-10 text-sm text-textPrimary placeholder:text-textMuted',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            Icon && 'pl-10',
            error
              ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
              : 'border-slate-300 hover:border-slate-400',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            [error ? `${inputId}-error` : null, showStrength ? `${inputId}-strength` : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textSecondary transition-colors cursor-pointer"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>

      {/* Error message */}
      {error && !showStrength && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-danger-600 flex items-center gap-1 animate-fade-in"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Strength meter + requirements */}
      {showStrength && watchValue && (
        <div id={`${inputId}-strength`} className="space-y-2 animate-fade-in">
          {/* Strength bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-primary-50 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  STRENGTH_COLORS[strength.level].bar
                )}
                style={{ width: `${strength.percentage}%` }}
              />
            </div>
            <span
              className={clsx(
                'text-xs font-medium capitalize',
                STRENGTH_COLORS[strength.level].text
              )}
            >
              {strength.level}
            </span>
          </div>

          {/* Requirements checklist */}
          <ul className="space-y-1" role="list" aria-label="Password requirements">
            {PASSWORD_REQUIREMENTS.map((req) => {
              const passed = req.test(watchValue);
              return (
                <li
                  key={req.key}
                  className={clsx(
                    'flex items-center gap-2 text-xs transition-colors duration-200',
                    passed ? 'text-success-600' : 'text-textMuted'
                  )}
                >
                  {passed ? (
                    <Check className="h-3.5 w-3.5 animate-checkmark" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                  {req.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
});

export default PasswordInput;
