import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'default' | 'outline' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  default: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400',
  outline: 'border border-slate-600 bg-slate-900/60 hover:bg-slate-800',
  ghost: 'hover:bg-slate-800/70',
  danger: 'bg-rose-500 text-white hover:bg-rose-400',
};

export function Button({
  className,
  children,
  variant = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        'rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
