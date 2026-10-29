import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhotoDialog } from "@/components/ui/photo-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Users, Vote } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Vote {
  id: string;
  voter_id: string;
  voter_name: string;
  voter_email: string;
  voter_class: string;
  voter_stream: string;
  voter_photo?: string;
  position_title: string;
  candidate_name: string;
  voted_at: string;
  vote_status: string;
}

interface TimeSlotVotersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  votes: Vote[];
  timeSlot: string;
  onStudentClick: (vote: Vote) => void;
}

export function TimeSlotVotersDialog({ 
  open, 
  onOpenChange, 
  votes, 
  timeSlot,
  onStudentClick 
}: TimeSlotVotersDialogProps) {
  // Get unique voters for this time slot
  const uniqueVoters = Array.from(
    new Map(votes.map(vote => [vote.voter_id, vote])).values()
  );

  const positionCounts = votes.reduce((acc, vote) => {
    acc[vote.position_title] = (acc[vote.position_title] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Votes Cast at {timeSlot}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {uniqueVoters.length} {uniqueVoters.length === 1 ? 'voter' : 'voters'}
            </div>
            <div className="flex items-center gap-1">
              <Vote className="h-4 w-4" />
              {votes.length} total votes
            </div>
          </div>
        </DialogHeader>

        {/* Position Breakdown */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(positionCounts).map(([position, count]) => (
            <Badge key={position} variant="outline">
              {position}: {count}
            </Badge>
          ))}
        </div>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-3">
            {uniqueVoters.map((vote) => {
              const voterVotes = votes.filter(v => v.voter_id === vote.voter_id);
              return (
                <div
                  key={vote.voter_id}
                  onClick={() => onStudentClick(vote)}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors group"
                >
                  <PhotoDialog 
                    photoUrl={vote.voter_photo} 
                    userName={vote.voter_name}
                    size="h-12 w-12"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{vote.voter_name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{vote.voter_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {vote.voter_class} - {vote.voter_stream}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="shrink-0">
                      {voterVotes.length} {voterVotes.length === 1 ? 'vote' : 'votes'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(vote.voted_at), 'HH:mm:ss')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
