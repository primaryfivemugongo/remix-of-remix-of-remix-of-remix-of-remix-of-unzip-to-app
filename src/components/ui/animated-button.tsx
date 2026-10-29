import { ReactNode } from 'react';
import { Button, ButtonProps } from './button';

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode;
  animation?: 'bounce' | 'wiggle' | 'pulse' | 'rainbow' | 'zoom';
  playAnimation?: boolean;
}

const animations = {
  bounce: 'animate-bounce',
  wiggle: 'animate-wiggle',
  pulse: 'animate-pulse-slow',
  rainbow: 'animate-rainbow',
  zoom: 'hover:scale-110 transition-transform duration-400 ease-out'
};

export function AnimatedButton({ 
  children, 
  className = '', 
  animation = 'zoom',
  playAnimation = false,
  ...props 
}: AnimatedButtonProps) {
  const animationClass = animations[animation];
  
  return (
    <Button
      {...props}
      className={`
        ${className} 
        ${playAnimation ? animationClass : ''}
        ${animation === 'zoom' ? animationClass : ''}
        transition-all 
        duration-400 
        ease-out
        transform-gpu 
        will-change-transform
        hover:shadow-lg
        active:scale-95
      `}
    >
      {children}
    </Button>
  );
}