// src/components/ui/Avatar.tsx
import React from 'react';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

interface AvatarProps {
  firstName: string;
  lastName: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
};

const colors = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
];

function getColorFromName(name: string): string {
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export const Avatar: React.FC<AvatarProps> = ({
  firstName,
  lastName,
  src,
  size = 'md',
  className,
}) => {
  const initials = getInitials(firstName, lastName);
  const colorClass = getColorFromName(firstName);

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium flex-shrink-0',
        sizeClasses[size],
        colorClass,
        className,
      )}
    >
      {initials}
    </span>
  );
};
