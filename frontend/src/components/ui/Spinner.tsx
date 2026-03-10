// src/components/ui/Spinner.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
  label = 'Chargement...',
}) => (
  <div className={cn('flex items-center justify-center gap-2 text-slate-400', className)}>
    <Loader2 className={cn('animate-spin', sizeClasses[size])} />
    {label && <span className="text-sm">{label}</span>}
  </div>
);

export const PageLoader: React.FC = () => (
  <div className="flex h-64 items-center justify-center">
    <Spinner size="lg" />
  </div>
);
