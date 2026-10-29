import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface Vote {
  id: string;
  voter_name: string;
  position: string;
  candidate_name: string;
  voted_at: string;
}

interface MobileVotesListProps {
  votes: Vote[];
}

export function MobileVotesList({ votes }: MobileVotesListProps) {
  const [newVoteIds, setNewVoteIds] = useState<Set<string>>(new Set());
  const [previousVoteIds] = useState<Set<string>>(new Set(votes.map(v => v.id)));

  useEffect(() => {
    const newIds = new Set(
      votes.filter(v => !previousVoteIds.has(v.id)).map(v => v.id)
    );
    
    if (newIds.size > 0) {
      setNewVoteIds(newIds);
      setTimeout(() => setNewVoteIds(new Set()), 1000);
    }
  }, [votes]);

  return (
    <div className="space-y-3">
      {votes.slice(0, 10).map((vote) => (
        <Card
          key={vote.id}
          className={cn(
            "p-4 transition-all duration-1000",
            newVoteIds.has(vote.id) && "bg-success/20 animate-in slide-in-from-top-2"
          )}
        >
          <div className="space-y-2">
            {/* Line 1: Voter name + time */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-foreground" id={`vote-${vote.id}`}>
                {vote.voter_name}
              </h4>
              <span 
                className="text-xs text-muted-foreground whitespace-nowrap"
                aria-label={`Voted ${formatDistanceToNow(new Date(vote.voted_at), { addSuffix: true })}`}
              >
                {formatDistanceToNow(new Date(vote.voted_at), { addSuffix: true })}
              </span>
            </div>

            {/* Line 2: Position - Candidate */}
            <div className="flex items-center gap-2 text-sm" aria-labelledby={`vote-${vote.id}`}>
              <Badge variant="secondary" className="text-xs">
                {vote.position}
              </Badge>
              <span className="text-muted-foreground">→</span>
              <span className="text-foreground">{vote.candidate_name}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
