import { ReactNode, HTMLAttributes } from 'react';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface ProfessionalCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
}

export function ProfessionalCard({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}: ProfessionalCardProps) {
  const variants = {
    default: 'hover:shadow-md border-border/50',
    elevated: 'shadow-sm hover:shadow-lg border-border/50',
    bordered: 'border-2 hover:border-primary/30 shadow-none hover:shadow-sm'
  };

  return (
    <Card
      {...props}
      className={cn(
        // Base professional styling
        'transition-all duration-300 ease-in-out cursor-pointer',
        'hover:-translate-y-1 group',
        // Remove playful animations, use subtle professional effects
        variants[variant],
        className
      )}
    >
      {children}
    </Card>
  );
}