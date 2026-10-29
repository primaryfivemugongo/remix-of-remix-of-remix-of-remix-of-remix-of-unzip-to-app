import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BallotHeader } from "./BallotHeader";
import { BallotFooter } from "./BallotFooter";
import { PositionBallot } from "./PositionBallot";
import { ReviewSection } from "./ReviewSection";
import { SuccessOverlay } from "./SuccessOverlay";

interface Candidate {
  id: string;
  name: string;
  email: string;
  photo?: string | null;
  class: string;
  stream: string;
}

interface Position {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
}

interface BallotContainerProps {
  positions: Position[];
  onVotePosition: (positionId: string, candidateId: string) => Promise<void>;
  onVoteComplete: (votes: Record<string, string>) => void;
}

// Optimized animation variants using GPU-accelerated properties only
const animationVariants = [
  {
    name: 'slide',
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as any }
  },
  {
    name: 'bounce',
    initial: { opacity: 0, y: 40, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -40, scale: 0.9 },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as any }
  },
  {
    name: 'flip',
    initial: { opacity: 0, rotateY: 45, scale: 0.9 },
    animate: { opacity: 1, rotateY: 0, scale: 1 },
    exit: { opacity: 0, rotateY: -45, scale: 0.9 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as any }
  },
  {
    name: 'zoom',
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as any }
  },
  {
    name: 'swipe',
    initial: { opacity: 0, x: -100, rotate: -5 },
    animate: { opacity: 1, x: 0, rotate: 0 },
    exit: { opacity: 0, x: 100, rotate: 5 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as any }
  },
  {
    name: 'fade',
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as any }
  }
];

export function BallotContainer({ 
  positions, 
  onVotePosition, 
  onVoteComplete 
}: BallotContainerProps) {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [isExiting, setIsExiting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentAnimation, setCurrentAnimation] = useState(animationVariants[0]);

  const totalPositions = positions.length;
  const currentPosition = positions[currentPositionIndex];

  // Get user ID on mount for user-specific storage keys
  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    const teacherId = localStorage.getItem('teacherId');
    const adminId = localStorage.getItem('adminId');
    setUserId(studentId || teacherId || adminId);
  }, []);

  // Restore session if available (user-specific)
  useEffect(() => {
    if (!userId || positions.length === 0) return;
    
    const savedData = sessionStorage.getItem(`ballotData_${userId}`);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        
        // Only restore selections that match CURRENT positions (in case positions were filtered)
        const validSelections: Record<string, string> = {};
        const validLocked: Record<string, boolean> = {};
        
        positions.forEach(pos => {
          if (data.selections?.[pos.id]) {
            validSelections[pos.id] = data.selections[pos.id];
            validLocked[pos.id] = data.locked?.[pos.id] || false;
          }
        });
        
        setSelections(validSelections);
        setLocked(validLocked);
        
        // Find first unvoted position
        const unvotedIndex = positions.findIndex(pos => !validSelections[pos.id]);
        if (unvotedIndex !== -1) {
          setCurrentPositionIndex(unvotedIndex);
        } else if (Object.keys(validSelections).length === positions.length) {
          setShowReview(true);
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
        // Clear corrupted session data
        sessionStorage.removeItem(`ballotData_${userId}`);
      }
    }
  }, [positions, userId]);

  // Save to session storage (user-specific)
  useEffect(() => {
    if (!userId) return;
    sessionStorage.setItem(`ballotData_${userId}`, JSON.stringify({ selections, locked }));
  }, [selections, locked, userId]);

  const handleSelectCandidate = async (candidateId: string) => {
    if (locked[currentPosition.id]) return;

    // Immediately mark as selected and lock
    const newSelections = { ...selections, [currentPosition.id]: candidateId };
    const newLocked = { ...locked, [currentPosition.id]: true };
    
    setSelections(newSelections);
    setLocked(newLocked);

    try {
      // Wait for vote to be recorded before advancing
      await onVotePosition(currentPosition.id, candidateId);
      
      // Auto-advance after successful vote
      setTimeout(() => {
        if (currentPositionIndex < totalPositions - 1) {
          advanceToNext();
        } else {
          // Last position - auto-submit after showing review briefly
          setTimeout(() => {
            handleFinalSubmit();
          }, 800);
        }
      }, 1500);
    } catch (error) {
      console.error('Error voting:', error);
      // Unlock position if vote fails
      setLocked({ ...locked, [currentPosition.id]: false });
      setSelections({ ...selections });
      alert(`Failed to record vote: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  const advanceToNext = () => {
    setIsExiting(true);
    
    setTimeout(() => {
      // Pick a random animation for the next position
      const randomAnimation = animationVariants[Math.floor(Math.random() * animationVariants.length)];
      setCurrentAnimation(randomAnimation);
      setCurrentPositionIndex(prev => prev + 1);
      setIsExiting(false);
    }, 300);
  };

  const handleFinalSubmit = () => {
    createConfetti();
    setShowSuccess(true);
    
    setTimeout(() => {
      if (userId) {
        sessionStorage.setItem(`voteSubmitted_${userId}`, 'true');
      }
      onVoteComplete(selections);
    }, 2000);
  };

  const createConfetti = () => {
    const colors = ['#667eea', '#764ba2', '#c9a961', '#2c3e50'];
    const confettiCount = 150;
    
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = Math.random() * 15 + 5 + 'px';
        confetti.style.height = Math.random() * 15 + 5 + 'px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-20px';
        confetti.style.opacity = '1';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        
        document.body.appendChild(confetti);
        
        const duration = Math.random() * 3 + 2;
        const drift = (Math.random() - 0.5) * 300;
        
        confetti.animate([
          { transform: 'translate(0, 0)', opacity: 1 },
          { transform: `translate(${drift}px, ${window.innerHeight + 50}px)`, opacity: 0 }
        ], {
          duration: duration * 1000,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        setTimeout(() => confetti.remove(), duration * 1000);
      }, i * 20);
    }
  };

  if (showSuccess) {
    return <SuccessOverlay isActive={true} />;
  }

  // Show loading state if positions haven't loaded yet
  if (!positions || positions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-lg font-semibold text-white">Loading ballot...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-5">
        <motion.div 
          className="max-w-[800px] w-full bg-[#fdfcf8] border-[3px] border-[#2c3e50] shadow-[0_20px_60px_rgba(0,0,0,0.3),inset_0_0_50px_rgba(0,0,0,0.02)] relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div 
              className="text-[180px] md:text-[240px] tracking-wider rotate-[-45deg]"
              style={{ 
                fontFamily: "'Courier New', Courier, monospace",
                color: '#9ca3af',
                opacity: 0.15,
                fontWeight: 900,
                WebkitTextStroke: '2px rgba(156, 163, 175, 0.2)'
              }}
            >
              GEC
            </div>
          </div>
          
          <div className="relative z-10">
            <BallotHeader />
          
          <div className="px-6 py-10 md:px-10 md:py-12 min-h-[500px] bg-[repeating-linear-gradient(0deg,transparent,transparent_30px,rgba(0,0,0,0.02)_30px,rgba(0,0,0,0.02)_31px)]">
            <AnimatePresence mode="wait">
              {!showReview && currentPosition && (
                <motion.div
                  key={currentPositionIndex}
                  initial={currentAnimation.initial}
                  animate={currentAnimation.animate}
                  exit={currentAnimation.exit}
                  transition={currentAnimation.transition}
                  style={{ 
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <PositionBallot
                    position={currentPosition}
                    positionNumber={currentPositionIndex + 1}
                    totalPositions={totalPositions}
                    selectedCandidateId={selections[currentPosition.id]}
                    isLocked={locked[currentPosition.id]}
                    isActive={!isExiting}
                    isExiting={isExiting}
                    onSelectCandidate={handleSelectCandidate}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <ReviewSection
              positions={positions}
              selections={selections}
              isActive={showReview}
            />
          </div>

            <BallotFooter
              totalPositions={totalPositions}
              currentPosition={currentPositionIndex}
              showSubmit={false}
              onSubmit={handleFinalSubmit}
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}
