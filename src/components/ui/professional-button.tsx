import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ProfessionalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const ProfessionalButton = forwardRef<HTMLButtonElement, ProfessionalButtonProps>(
  ({ children, className = '', variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        {...props}
        className={cn(
          // Professional hover effects - subtle and clean
          'transition-all duration-200 ease-in-out',
          'hover:-translate-y-0.5 hover:shadow-sm',
          // Remove bounce and playful animations
          'focus:ring-2 focus:ring-primary/20 focus:outline-none',
          className
        )}
      >
        {children}
      </Button>
    );
  }
);

ProfessionalButton.displayName = 'ProfessionalButton';