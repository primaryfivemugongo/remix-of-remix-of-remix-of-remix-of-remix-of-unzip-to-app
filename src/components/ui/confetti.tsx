import { useEffect, useState } from "react";

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; color: string; delay: number; duration: number; startX: number }>>([]);

  useEffect(() => {
    if (isActive) {
      const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
        'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-indigo-500'
      ];
      
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 1000,
        duration: 2000 + Math.random() * 1000,
        startX: Math.random() * 100
      }));
      
      setPieces(newPieces);
      
      // Clear confetti after animation
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 3500);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute w-3 h-3 ${piece.color} rounded-sm opacity-90`}
          style={{
            left: `${piece.startX}%`,
            top: '-20px',
            animation: `fall-${piece.id} ${piece.duration}ms linear ${piece.delay}ms forwards`,
            transform: 'rotate(45deg)'
          }}
        />
      ))}
      <style>{`
        ${pieces.map((piece) => `
          @keyframes fall-${piece.id} {
            to {
              transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg);
              opacity: 0;
            }
          }
        `).join('')}
      `}</style>
    </div>
  );
}