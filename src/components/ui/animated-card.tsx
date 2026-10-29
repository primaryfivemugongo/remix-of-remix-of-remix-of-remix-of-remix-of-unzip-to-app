import { ReactNode, HTMLAttributes } from 'react';
import { Card } from './card';

interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverAnimation?: 'bounce' | 'wiggle' | 'float' | 'zoom' | 'rainbow';
  delay?: number;
}

const hoverAnimations = {
  bounce: 'hover:animate-bounce',
  wiggle: 'hover:animate-wiggle', 
  float: 'hover:animate-float',
  zoom: 'hover:scale-110 transition-transform duration-500 ease-out',
  rainbow: 'hover:animate-rainbow'
};

export function AnimatedCard({ 
  children, 
  className = '', 
  hoverAnimation = 'zoom',
  delay = 0,
  ...props 
}: AnimatedCardProps) {
  const animationClass = hoverAnimations[hoverAnimation];
  const delayClass = delay > 0 ? `animation-delay-${delay}` : '';
  
  return (
    <Card
      {...props}
      className={`
        ${className} 
        ${animationClass}
        ${delayClass}
        animate-fade-in
        transition-all 
        duration-500 
        ease-out
        cursor-pointer
        transform-gpu 
        will-change-transform
        hover:shadow-2xl
        hover:border-primary/50
      `}
    >
      {children}
    </Card>
  );
}