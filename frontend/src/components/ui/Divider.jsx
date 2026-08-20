import clsx from 'clsx';

/**
 * Horizontal divider with optional centre text.
 */
export default function Divider({ text, className }) {
  if (text) {
    return (
      <div className={clsx('flex items-center gap-4', className)}>
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-textMuted font-medium uppercase tracking-wider">
          {text}
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
    );
  }

  return <hr className={clsx('border-none h-px bg-slate-200', className)} />;
}
