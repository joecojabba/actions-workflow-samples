import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-xs', className)} {...props} />;
}
