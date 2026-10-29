import React, { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

type AnimationType = 
  | 'fadeIn' 
  | 'fadeInUp' 
  | 'fadeInDown' 
  | 'fadeInLeft' 
  | 'fadeInRight'
  | 'slideInUp'
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight'
  | 'zoomIn'
  | 'bounceIn';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
}

const animationClasses: Record<AnimationType, string> = {
  fadeIn: 'animate-fade-in',
  fadeInUp: 'animate-slide-up',
  fadeInDown: 'animate-slide-down', 
  fadeInLeft: 'animate-slide-in-left',
  fadeInRight: 'animate-slide-in-right',
  slideInUp: 'animate-slide-up',
  slideInDown: 'animate-slide-down',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  zoomIn: 'animate-zoom-in',
  bounceIn: 'animate-bounce-in'
};

export function ScrollReveal({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  triggerOnce = true,
  className
}: ScrollRevealProps) {
  const { elementRef, isVisible } = useScrollAnimation({ 
    threshold, 
    triggerOnce 
  });

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all ease-out',
        isVisible ? animationClasses[animation] : 'opacity-0 translate-y-8',
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
}