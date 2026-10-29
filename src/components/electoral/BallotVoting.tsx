import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Lock, AlertTriangle, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

interface Candidate {
  id: string;
  name: string;
  email: string;
  photo?: string | null;
  class: string;
  stream: string;
  experience: string;
  qualifications: string;
  whyApply: string;
}

interface Position {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
}

interface BallotVotingProps {
  positions: Position[];
  onVoteComplete: (votes: Record<string, string>) => void;
  onVotePosition: (positionId: string, candidateId: string) => Promise<void>;
}

export function BallotVoting({ positions, onVoteComplete, onVotePosition }: BallotVotingProps) {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const ballotBodyRef = useRef<HTMLDivElement>(null);

  const currentPosition = positions[currentPositionIndex];
  const totalPositions = positions.length;
  const isLastPosition = currentPositionIndex === totalPositions - 1;

  useEffect(() => {
    // Restore session if available
    const savedData = sessionStorage.getItem('ballotData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setSelections(data.selections || {});
        setLocked(data.locked || {});
        
        // Find first unvoted position
        const unvotedIndex = positions.findIndex(pos => !data.selections[pos.id]);
        if (unvotedIndex !== -1) {
          setCurrentPositionIndex(unvotedIndex);
        } else if (Object.keys(data.selections).length === positions.length) {
          setShowReview(true);
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      }
    }
  }, [positions]);

  useEffect(() => {
    // Save to session storage
    sessionStorage.setItem('ballotData', JSON.stringify({ selections, locked }));
  }, [selections, locked]);

  const handleCandidateSelect = async (candidateId: string) => {
    if (locked[currentPosition.id]) return;

    try {
      // Mark as selected with animation
      const newSelections = { ...selections, [currentPosition.id]: candidateId };
      const newLocked = { ...locked, [currentPosition.id]: true };
      
      setSelections(newSelections);
      setLocked(newLocked);

      // Submit vote to database
      await onVotePosition(currentPosition.id, candidateId);

      // Auto-advance after animation
      setTimeout(() => {
        if (!isLastPosition) {
          advanceToNext();
        } else {
          // Show review page
          setTimeout(() => setShowReview(true), 800);
        }
      }, 1500);
    } catch (error) {
      console.error('Error voting:', error);
      // Revert on error
      const revertedSelections = { ...selections };
      const revertedLocked = { ...locked };
      delete revertedSelections[currentPosition.id];
      delete revertedLocked[currentPosition.id];
      setSelections(revertedSelections);
      setLocked(revertedLocked);
    }
  };

  const advanceToNext = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentPositionIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 400);
  };

  const handleFinalSubmit = () => {
    createConfetti();
    setShowSuccess(true);
    
    setTimeout(() => {
      sessionStorage.setItem('voteSubmitted', 'true');
      onVoteComplete(selections);
    }, 2000);
  };

  const createConfetti = () => {
    // Trigger confetti animation
    const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
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
      }, i * 15);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-slate-700/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-in zoom-in duration-500 bg-white">
          <CardContent className="p-12 text-center space-y-6">
            <div className="text-6xl animate-bounce">
              <PartyPopper className="h-20 w-20 mx-auto text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Vote Submitted!</h2>
            <p className="text-slate-600 text-lg">
              Thank you for participating in the Student Council Elections. Your vote has been recorded and will be counted!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showReview) {
    return (
      <div ref={ballotBodyRef} className="animate-in fade-in duration-500 min-h-screen bg-slate-700 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full border-2 border-slate-600 bg-slate-800 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold uppercase tracking-wider mb-2 text-white">Review Your Ballot</h2>
              <div className="flex items-center justify-center gap-2 text-sm text-green-200 bg-green-900/40 border border-green-600 px-4 py-2 rounded-lg">
                <Lock className="h-4 w-4" />
                <span className="font-semibold">Your selections are locked and cannot be changed</span>
              </div>
            </div>

            <ScrollArea className="max-h-[500px] pr-4">
              <div className="space-y-4">
                {positions.map(position => {
                  const selectedCandidateId = selections[position.id];
                  const candidate = position.candidates.find(c => c.id === selectedCandidateId);
                  
                  return (
                    <Card key={position.id} className="border-2 border-slate-300 bg-white">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                            {position.title}
                          </div>
                          <div className="text-xl font-bold text-slate-900">
                            {candidate?.name || 'No selection'}
                          </div>
                        </div>
                        <Lock className="h-6 w-6 text-slate-400" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                onClick={handleFinalSubmit}
                className="px-12 py-6 text-lg uppercase tracking-widest font-bold bg-green-600 hover:bg-green-700 text-white"
              >
                Submit Ballot
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentPosition) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No positions available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-700">
      <Card 
        className={cn(
          "max-w-3xl w-full border-2 border-slate-600 bg-slate-800 shadow-2xl transition-all duration-500",
          isAnimating && "opacity-0 -translate-x-12"
        )}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-8 py-6 text-center border-b-4 border-slate-600">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-2">
            🗳️ Official Ballot
          </h1>
          <p className="text-sm md:text-base opacity-90 italic">
            Student Council Elections 2025
          </p>
        </div>

        {/* Body */}
        <div 
          ref={ballotBodyRef}
          className="p-6 md:p-10 min-h-[500px] bg-slate-700"
        >
          {/* Position Info */}
          <div className="text-center mb-8 pb-6 border-b-2 border-slate-500">
            <Badge className="mb-4 px-4 py-1 text-sm uppercase tracking-wide bg-slate-600 text-white hover:bg-slate-500">
              Position {currentPositionIndex + 1} of {totalPositions}
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wide mb-2 text-white">
              {currentPosition.title}
            </h2>
            <p className="text-sm md:text-base text-slate-300 italic">
              (Vote for ONE)
            </p>
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-900/40 border-2 border-yellow-600 p-4 mb-6 text-center rounded-lg">
            <div className="flex items-center justify-center gap-2 text-yellow-200 font-bold">
              <AlertTriangle className="h-5 w-5" />
              <span>WARNING: Once you mark your choice, it CANNOT be changed!</span>
            </div>
          </div>

          {/* Candidates List */}
          <div className="space-y-4">
            {currentPosition.candidates.map(candidate => {
              const isSelected = selections[currentPosition.id] === candidate.id;
              const isLocked = locked[currentPosition.id];
              
              return (
                <Card
                  key={candidate.id}
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-2 bg-white hover:shadow-lg",
                    isSelected && "border-green-500 shadow-[0_4px_0_rgb(34,197,94)] translate-x-1",
                    isLocked && "opacity-60 cursor-not-allowed",
                    !isLocked && "hover:translate-x-1 hover:shadow-[0_4px_0_rgb(203,213,225)] border-slate-300"
                  )}
                  onClick={() => !isLocked && handleCandidateSelect(candidate.id)}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className={cn(
                      "h-14 w-14 border-2 transition-all",
                      isSelected ? "border-green-500 shadow-lg scale-105" : "border-slate-300"
                    )}>
                      <AvatarImage src={candidate.photo || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold">
                        {getInitials(candidate.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Candidate Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold truncate text-slate-900">{candidate.name}</h3>
                      <p className="text-sm text-slate-600">
                        {candidate.class} - {candidate.stream}
                      </p>
                      {candidate.whyApply && (
                        <p className="text-xs md:text-sm text-slate-500 italic mt-1 line-clamp-1">
                          "{candidate.whyApply}"
                        </p>
                      )}
                    </div>

                    {/* Checkbox */}
                    <div 
                      className={cn(
                        "h-10 w-10 border-2 flex items-center justify-center transition-all duration-500 rounded overflow-hidden",
                        isSelected 
                          ? "bg-green-500 border-green-500 scale-110" 
                          : "bg-white border-slate-400 scale-100"
                      )}
                    >
                      <CheckCircle 
                        className={cn(
                          "h-6 w-6 text-white transition-all duration-700 ease-out",
                          isSelected 
                            ? "opacity-100 scale-100 rotate-0 animate-in zoom-in duration-700" 
                            : "opacity-0 scale-0 rotate-[-120deg]"
                        )}
                        style={{
                          animationDelay: isSelected ? '100ms' : '0ms',
                          strokeDasharray: isSelected ? '100' : '0',
                          strokeDashoffset: isSelected ? '0' : '100',
                          transition: 'stroke-dashoffset 0.8s ease-in-out, opacity 0.7s ease-out, transform 0.7s ease-out'
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer - Progress */}
        <div className="bg-slate-900 px-8 py-6 border-t-2 border-slate-600 flex justify-center">
          <div className="flex gap-3">
            {Array.from({ length: totalPositions }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-3 w-3 rounded-full border-2 transition-all duration-300",
                  index < currentPositionIndex 
                    ? "bg-green-500 border-green-500" 
                    : index === currentPositionIndex
                    ? "bg-blue-500 border-blue-500 h-4 w-4 shadow-lg"
                    : "bg-slate-700 border-slate-400"
                )}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
