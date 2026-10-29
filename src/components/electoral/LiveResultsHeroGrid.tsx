import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { PhotoDialog } from "@/components/ui/photo-dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Medal, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Candidate {
  id: string;
  name: string;
  photo: string | null;
  votes: number;
  class: string;
  stream: string;
  rank: number;
}

interface Position {
  id: string;
  title: string;
  candidates: Candidate[];
}

interface LiveResultsHeroGridProps {
  positions: Position[];
}

export function LiveResultsHeroGrid({ positions }: LiveResultsHeroGridProps) {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [candidatesMap, setCandidatesMap] = useState<Map<string, Candidate[]>>(new Map());
  const [animatingVotes, setAnimatingVotes] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout>(undefined);
  const previousVotesRef = useRef<Map<string, number>>(new Map());

  // Initialize candidates map
  useEffect(() => {
    const newMap = new Map<string, Candidate[]>();
    positions.forEach(position => {
      newMap.set(position.id, position.candidates);
    });
    setCandidatesMap(newMap);
  }, [positions]);

  // Set up real-time subscription for vote updates
  useEffect(() => {
    const channel = supabase
      .channel('live-results-hero-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'electoral_votes'
        },
        async () => {
          // Reload vote counts for all positions
          await reloadVoteCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [positions]);

  // Auto-scroll every 60 seconds
  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollTimerRef.current = setInterval(() => {
        setCurrentPositionIndex(prev => 
          prev < positions.length - 1 ? prev + 1 : 0
        );
      }, 60000); // 60 seconds
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [positions.length]);

  // Smooth scroll to position when index changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const element = scrollContainerRef.current;
      const scrollWidth = element.scrollWidth;
      const targetScroll = (scrollWidth / positions.length) * currentPositionIndex;
      
      element.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [currentPositionIndex, positions.length]);

  const reloadVoteCounts = async () => {
    try {
      const { data: votesData, error } = await supabase
        .from('electoral_votes')
        .select('candidate_id, position, vote_status')
        .eq('vote_status', 'valid')
        .limit(100000);

      if (error) throw error;

      // Update vote counts and re-sort
      const newMap = new Map(candidatesMap);
      const changedCandidates = new Set<string>();
      
      positions.forEach(position => {
        const positionVotes = votesData?.filter(v => v.position === position.title) || [];
        const voteCounts: Record<string, number> = {};
        
        positionVotes.forEach(vote => {
          voteCounts[vote.candidate_id] = (voteCounts[vote.candidate_id] || 0) + 1;
        });

        const updatedCandidates = position.candidates.map(candidate => {
          const newVotes = voteCounts[candidate.id] || 0;
          const oldVotes = previousVotesRef.current.get(candidate.id) || 0;
          
          // Track if votes changed
          if (newVotes !== oldVotes) {
            changedCandidates.add(candidate.id);
          }
          
          previousVotesRef.current.set(candidate.id, newVotes);
          
          return {
            ...candidate,
            votes: newVotes
          };
        }).sort((a, b) => b.votes - a.votes)
          .map((candidate, index) => ({
            ...candidate,
            rank: index + 1
          }));

        newMap.set(position.id, updatedCandidates);
      });

      // Trigger animation for changed candidates
      if (changedCandidates.size > 0) {
        setAnimatingVotes(changedCandidates);
        setTimeout(() => setAnimatingVotes(new Set()), 1000);
      }

      setCandidatesMap(newMap);
    } catch (error) {
      console.error('Error reloading vote counts:', error);
    }
  };

  const handlePrevious = () => {
    setCurrentPositionIndex(prev => 
      prev > 0 ? prev - 1 : positions.length - 1
    );
    // Reset auto-scroll timer
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
  };

  const handleNext = () => {
    setCurrentPositionIndex(prev => 
      prev < positions.length - 1 ? prev + 1 : 0
    );
    // Reset auto-scroll timer
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-none">
          <Trophy className="h-4 w-4 mr-1" />
          1st
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-none">
          <Award className="h-4 w-4 mr-1" />
          2nd
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none">
          <Medal className="h-4 w-4 mr-1" />
          3rd
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        #{rank}
      </Badge>
    );
  };

  if (positions.length === 0) {
    return null;
  }

  const currentPosition = positions[currentPositionIndex];
  const currentCandidates = candidatesMap.get(currentPosition.id) || currentPosition.candidates;

  return (
    <div className="space-y-6">
      {/* Position Header with Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center flex-1">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            {currentPosition.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Position {currentPositionIndex + 1} of {positions.length}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Candidates Grid with Animation */}
      <div 
        ref={scrollContainerRef}
        className="overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPosition.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {currentCandidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  ...(animatingVotes.has(candidate.id) && {
                    boxShadow: [
                      '0 0 0px rgba(var(--primary-rgb), 0)',
                      '0 0 20px rgba(var(--primary-rgb), 0.6)',
                      '0 0 0px rgba(var(--primary-rgb), 0)'
                    ]
                  })
                }}
                transition={{
                  layout: { duration: 0.6, type: "spring", bounce: 0.3 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3, delay: index * 0.05 },
                  boxShadow: { duration: 0.8 }
                }}
                className="relative"
              >
                <motion.div
                  className={`h-full bg-gradient-to-br from-card to-card/80 rounded-lg border p-6 hover:shadow-xl transition-shadow duration-300 ${
                    animatingVotes.has(candidate.id) ? 'border-primary' : 'border-border'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  animate={animatingVotes.has(candidate.id) ? {
                    borderColor: [
                      'hsl(var(--border))',
                      'hsl(var(--primary))',
                      'hsl(var(--border))'
                    ]
                  } : {}}
                  transition={{
                    borderColor: { duration: 0.8 }
                  }}
                  style={{
                    willChange: 'transform',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {getRankBadge(candidate.rank)}
                  </div>

                  {/* Photo */}
                  <div className="flex justify-center mb-4">
                    <PhotoDialog
                      photoUrl={candidate.photo}
                      userName={candidate.name}
                      size="h-32 w-32 ring-4 ring-primary/20 hover:ring-primary/40 transition-all"
                    />
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-bold text-center mb-2 line-clamp-2">
                    {candidate.name}
                  </h3>

                  {/* Class & Stream */}
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {candidate.class} - {candidate.stream}
                  </p>

                  {/* Votes Count */}
                  <motion.div 
                    className="flex items-center justify-center gap-2 pt-4 border-t border-border"
                    animate={animatingVotes.has(candidate.id) ? {
                      scale: [1, 1.15, 1],
                      backgroundColor: [
                        'hsl(var(--card))',
                        'hsl(var(--primary) / 0.1)',
                        'hsl(var(--card))'
                      ]
                    } : {}}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <TrendingUp 
                      className={`h-5 w-5 text-primary transition-all duration-300 ${
                        animatingVotes.has(candidate.id) ? 'animate-pulse' : ''
                      }`} 
                    />
                    <motion.span 
                      className="text-3xl font-bold text-primary tabular-nums"
                      animate={animatingVotes.has(candidate.id) ? {
                        scale: [1, 1.3, 1],
                        color: [
                          'hsl(var(--primary))',
                          'hsl(var(--primary) / 1.2)',
                          'hsl(var(--primary))'
                        ]
                      } : {}}
                      transition={{ duration: 0.6 }}
                      key={candidate.votes}
                    >
                      {candidate.votes}
                    </motion.span>
                    <span className="text-sm text-muted-foreground">
                      {candidate.votes === 1 ? 'vote' : 'votes'}
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Position Indicators */}
      <div className="flex justify-center gap-2">
        {positions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPositionIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentPositionIndex 
                ? 'w-8 bg-primary' 
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to position ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
