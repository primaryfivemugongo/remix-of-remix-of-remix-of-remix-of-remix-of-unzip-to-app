import { ReactNode, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const pageTransitions = [
  'animate-fade-in',
  'animate-slide-in-left',
  'animate-slide-in-right', 
  'animate-slide-up',
  'animate-slide-down',
  'animate-zoom-in',
  'animate-bounce-in',
  'animate-swipe-left',
  'animate-swipe-right',
  'animate-swipe-up',
  'animate-swipe-down',
  'animate-flip-x',
  'animate-flip-y',
  'animate-zoom-bounce',
  'animate-scale-in'
];

// Mount inside a page's content, never around the router Outlet.
// An entrance belongs to this content instance, not an incoming URL.
export function PageTransition({ children }: PageTransitionProps) {
  const [animation] = useState(
    () => pageTransitions[Math.floor(Math.random() * pageTransitions.length)]
  );

  return (
    <div className={`page-content-entrance ${animation} motion-reduce:animate-none`}>
      {children}
    </div>
  );
}