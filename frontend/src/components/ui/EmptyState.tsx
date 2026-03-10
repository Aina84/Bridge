// src/components/ui/EmptyState.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
    {icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        {icon}
      </div>
    )}
    <p className="font-heading text-sm font-semibold text-slate-700">{title}</p>
    {description && (
      <p className="mt-1 text-sm text-slate-400 max-w-xs">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
